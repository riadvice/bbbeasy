<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with BBBeasy. If not, see <https://www.gnu.org/licenses/>
 */

namespace Core;

use DB\SQL;
use Enum\UserStatus;
use Log\LogWriterTrait;
use Models\User;

class Session extends \Prefab
{
    use LogWriterTrait;

    /**
     * f3 instance.
     *
     * @var \Base f3
     */
    protected $f3;

    /**
     * Current authenticated user.
     *
     * @var null|User
     */
    private $currentUser;

    /**
     * Runtime values kept for the current request only.
     *
     * @var array<string, mixed>
     */
    private array $runtimeValues = [];

    /**
     * Decoded JWT claims.
     *
     * @var array<string, mixed>
     */
    private array $tokenClaims = [];

    /**
     * Raw bearer token.
     */
    private ?string $accessToken = null;

    /**
     * Token generated during the current request.
     */
    private ?string $issuedToken = null;

    public function __construct(?SQL $db = null, $table = 'sessions', $force = false, $onsuspect = null, $key = null)
    {
        $this->f3 = \Base::instance();
        $this->initLogger();
        $this->hydrateFromRequest();
    }

    public function cleanupOldSessions(): void
    {
        $this->logger->notice('Cleaning up revoked JWT cache entries');
    }

    public function exists($key): bool
    {
        return null !== $this->get($key);
    }

    public function set($key, $value): void
    {
        $this->runtimeValues[$key] = $value;
        $this->f3->set('SESSION.' . $key, $value);
    }

    /**
     * @param mixed $key
     *
     * @return mixed
     */
    public function get($key)
    {
        if ('user' === $key) {
            return $this->currentUser ? $this->serializeUser($this->currentUser) : null;
        }

        if (isset($this->runtimeValues[$key])) {
            return $this->runtimeValues[$key];
        }

        if (!$this->currentUser instanceof User) {
            return null;
        }

        return match ($key) {
            'user.id'          => $this->currentUser->id,
            'user.role'        => $this->currentUser->role->name,
            'user.roleId'      => $this->currentUser->role->id,
            'user.username'    => $this->currentUser->username,
            'user.email'       => $this->currentUser->email,
            'user.avatar'      => $this->currentUser->avatar,
            'user.permissions' => $this->currentUser->role->getRolePermissions(),
            'locale'           => $this->runtimeValues['locale'] ?? null,
            default            => $this->runtimeValues[$key] ?? null,
        };
    }

    public function cleanup($max): bool
    {
        return true;
    }

    public function isLoggedIn(): bool
    {
        return $this->currentUser instanceof User;
    }

    /**
     * Issue a new JWT for the given user and keep the user loaded in memory.
     */
    public function authorizeUser(User $user): string
    {
        $this->setCurrentUser($user);
        $claims            = $this->buildClaims($this->currentUser);
        $this->tokenClaims = $claims;
        $this->issuedToken = $this->createToken($claims);
        $this->accessToken = $this->issuedToken;

        $this->logger->debug("User with id {$user->id} received a JWT access token");

        return $this->issuedToken;
    }

    /**
     * @param $user User
     */
    public function updateUser(User $user): void
    {
        if ($this->currentUser instanceof User && $this->currentUser->id === $user->id) {
            $this->currentUser = $user;
        }

        $this->logger->debug("User with id {$user->id} is now updated");
    }

    /**
     * Revoke the currently authenticated token.
     */
    public function revokeUser(): void
    {
        if (!empty($this->tokenClaims['jti']) && !empty($this->tokenClaims['exp'])) {
            $ttl      = max(1, (int) $this->tokenClaims['exp'] - time());
            $cacheKey = $this->revokedTokenCacheKey((string) $this->tokenClaims['jti']);
            \Cache::instance()->set($cacheKey, 1, $ttl);
            $this->logger->debug('Revoked JWT token', ['jti' => $this->tokenClaims['jti'], 'ttl' => $ttl]);
        }

        $this->currentUser   = null;
        $this->tokenClaims   = [];
        $this->accessToken   = null;
        $this->issuedToken   = null;
        $this->runtimeValues = [];
        $this->f3->clear('SESSION');
    }

    public function getRole(): string
    {
        return $this->currentUser instanceof User ? $this->currentUser->role->name : '';
    }

    public function getRoleId(): int
    {
        return $this->currentUser instanceof User ? (int) $this->currentUser->role->id : 0;
    }

    /**
     * @return null|string
     */
    public function sid()
    {
        return $this->tokenClaims['jti'] ?? null;
    }

    public function getAccessToken(): ?string
    {
        return $this->issuedToken ?? $this->accessToken;
    }

    public function getTokenExpiresAt(): ?string
    {
        if (empty($this->tokenClaims['exp'])) {
            return null;
        }

        return date('c', (int) $this->tokenClaims['exp']);
    }

    private function hydrateFromRequest(): void
    {
        $header = $this->f3->get('HEADERS.Authorization') ?: $this->f3->get('HEADERS.X-Authorization');
        if (!$header || !preg_match('/^Bearer\s+(.*)$/i', mb_trim((string) $header), $matches)) {
            return;
        }

        $token  = mb_trim($matches[1]);
        $claims = $this->decodeToken($token);
        if (empty($claims)) {
            $this->logger->warning('Rejected malformed or invalid JWT access token');

            return;
        }

        $user = $this->loadUserById((int) $claims['sub']);
        if (!$user) {
            $this->logger->warning('Rejected JWT for a missing user', ['sub' => $claims['sub'] ?? null]);

            return;
        }

        $this->currentUser = $user;
        $this->tokenClaims = $claims;
        $this->accessToken = $token;
        $this->syncSessionState();
    }

    private function setCurrentUser(User $user): void
    {
        $loadedUser        = $this->loadUserById((int) $user->id);
        $this->currentUser = $loadedUser ?? $user;
        $this->syncSessionState();
    }

    private function loadUserById(int $userId): ?User
    {
        $user = new User();
        $user = $user->getById($userId);
        if (!$user->valid()) {
            return null;
        }

        if (!isset($user->status) || UserStatus::ACTIVE !== $user->status) {
            return null;
        }

        return $user;
    }

    private function serializeUser(User $user): array
    {
        return [
            'id'          => $user->id,
            'username'    => $user->username,
            'email'       => $user->email,
            'role'        => $user->role->name,
            'avatar'      => $user->avatar,
            'permissions' => $user->role->getRolePermissions(),
        ];
    }

    private function syncSessionState(): void
    {
        if (!$this->currentUser instanceof User) {
            return;
        }

        $user             = $this->serializeUser($this->currentUser);
        $user['loggedIn'] = true;

        $this->f3->set('SESSION.user', $user);
        $this->f3->set('SESSION.user.loggedIn', true);
        $this->f3->set('SESSION.user.id', $user['id']);
        $this->f3->set('SESSION.user.role', $user['role']);
        $this->f3->set('SESSION.user.roleId', $this->currentUser->role->id);
        $this->f3->set('SESSION.user.username', $user['username']);
        $this->f3->set('SESSION.user.email', $user['email']);
    }

    /**
     * @param array<string, mixed> $claims
     */
    private function createToken(array $claims): string
    {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT',
        ];

        $segments = [
            $this->base64UrlEncode(json_encode($header, JSON_THROW_ON_ERROR)),
            $this->base64UrlEncode(json_encode($claims, JSON_THROW_ON_ERROR)),
        ];

        $signingInput = implode('.', $segments);
        $signature    = hash_hmac('sha256', $signingInput, $this->getSecret(), true);
        $segments[]   = $this->base64UrlEncode($signature);

        return implode('.', $segments);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildClaims(User $user): array
    {
        $issuedAt = time();
        $ttl      = (int) ($this->f3->get('auth.jwt.ttl') ?: 3600);

        return [
            'iss'     => $this->f3->get('SERVER.HTTP_ORIGIN') ?: $this->f3->get('HOST'),
            'aud'     => 'bbbeasy',
            'iat'     => $issuedAt,
            'nbf'     => $issuedAt - 30,
            'exp'     => $issuedAt + $ttl,
            'jti'     => bin2hex(random_bytes(16)),
            'sub'     => (string) $user->id,
            'role_id' => (int) $user->role->id,
            'role'    => $user->role->name,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeToken(string $token): array
    {
        $parts = explode('.', $token);
        if (3 !== \count($parts)) {
            return [];
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
        $header                                              = $this->jsonDecode($this->base64UrlDecode($encodedHeader));
        $payload                                             = $this->jsonDecode($this->base64UrlDecode($encodedPayload));
        if (empty($header) || empty($payload)) {
            return [];
        }

        if (($header['alg'] ?? null) !== 'HS256') {
            return [];
        }

        $expectedSignature = $this->base64UrlEncode(hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, $this->getSecret(), true));
        if (!hash_equals($expectedSignature, $encodedSignature)) {
            return [];
        }

        $now = time();
        if (isset($payload['nbf']) && (int) $payload['nbf'] > $now + (int) ($this->f3->get('auth.jwt.leeway') ?: 30)) {
            return [];
        }
        if (isset($payload['exp']) && (int) $payload['exp'] < $now) {
            return [];
        }
        if (isset($payload['jti']) && $this->isRevoked((string) $payload['jti'])) {
            return [];
        }
        if (($payload['aud'] ?? null) !== 'bbbeasy') {
            return [];
        }

        return $payload;
    }

    private function isRevoked(string $jti): bool
    {
        if ('' === $jti) {
            return true;
        }

        return null !== \Cache::instance()->get($this->revokedTokenCacheKey($jti));
    }

    private function revokedTokenCacheKey(string $jti): string
    {
        return 'jwt.revoked.' . $jti;
    }

    private function getSecret(): string
    {
        $secret = (string) $this->f3->get('auth.jwt.secret');
        if ('' !== mb_trim($secret)) {
            return $secret;
        }

        $secretFile = $this->f3->get('ROOT') . \DIRECTORY_SEPARATOR . $this->f3->get('TEMP') . 'jwt.secret';
        if (is_file($secretFile)) {
            $storedSecret = mb_trim((string) file_get_contents($secretFile));
            if ('' !== $storedSecret) {
                return $storedSecret;
            }
        }

        $directory = \dirname($secretFile);
        if (!is_dir($directory)) {
            mkdir($directory, 0o770, true);
        }

        $generatedSecret = bin2hex(random_bytes(64));
        file_put_contents($secretFile, $generatedSecret, LOCK_EX);
        @chmod($secretFile, 0o600);

        return $generatedSecret;
    }

    private function base64UrlEncode(string $data): string
    {
        return mb_rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        $remainder = mb_strlen($data) % 4;
        if (0 !== $remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }

        return (string) base64_decode(strtr($data, '-_', '+/'), true);
    }

    /**
     * @return array<string, mixed>
     */
    private function jsonDecode(string $json): array
    {
        $decoded = json_decode($json, true);

        return \is_array($decoded) ? $decoded : [];
    }
}
