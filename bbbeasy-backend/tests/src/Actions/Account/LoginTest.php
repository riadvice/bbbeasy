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

namespace Actions\Account;

use Enum\UserRole;
use Enum\UserStatus;
use Fake\UserFaker;
use Faker\Factory as Faker;
use Models\User;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class LoginTest extends Scenario
{
    final protected const LOGIN_ROUTE = 'POST /account/login';
    protected $group                  = 'Action User Login';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \JsonException
     */
    public function testAuthenticateInvalidUser($f3)
    {
        $test  = $this->newTest();
        $faker = Faker::create();

        $data = ['email' => '', 'password' => ''];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_error.json'), 'Login with empty data show an error');

        $data = ['email' => $faker->firstName, 'password' => $faker->password(8)];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_error.json'), 'Login with invalid email format show an error');

        $data = ['email' => $faker->firstName, 'password' => $faker->password(3)];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_error.json'), 'Login with too short password and invalid email show an error');

        $data = ['email' => $faker->email, 'password' => $faker->password(8)];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_invalid_error.json'), 'Login with non existing credentials shows error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \JsonException
     */
    public function testAuthenticateExistingNonActiveUser($f3)
    {
        $test           = $this->newTest();
        $faker          = Faker::create();
        $rawPassword    = $faker->password(8);
        $user           = new User();
        $user->email    = $faker->email;
        $user->username = $faker->userName;
        $user->password = $rawPassword;
        $user->status   = UserStatus::PENDING;
        $user->role_id  = UserRole::LECTURER_ID;
        $user->save();

        $data = ['email' => $user->email, 'password' => $rawPassword];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_not_active_error.json'), 'Login with correct credentials and "' . $user->status . '" status show an error');

        $user->status = UserStatus::INACTIVE;
        $user->save();
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_not_active_error.json'), 'Login with correct credentials and "' . $user->status . '" status show an error');

        $user->status = UserStatus::DELETED;
        $user->save();
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_deleted_error.json'), 'Login with correct credentials and "' . $user->status . '" status show an error');

        $user->status = UserStatus::ACTIVE;
        $user->save();
        $errorData = ['email' => $user->email, 'password' => $faker->password(8)];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($errorData));

        $attempts = --$user->password_attempts;
        $test->expect($this->compareArrayToResponse([
            'message' => "Wrong password. Attempts left : {$attempts}",
            'status'  => 400,
        ]), 'Login with user "' . $user->email . '" with status ' . $user->status . ' and wrong password show an error');

        $user->password_attempts = 0;
        $user->save();
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($errorData));
        $test->expect($this->compareTemplateToResponse('account/authentication_locked_error.json'), 'Login with user "' . $user->email . '" with status ' . $user->status . ' and 2 wrong attempts has locked user account');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testAuthenticateExistingUser($f3)
    {
        $test = $this->newTest();
        $user = UserFaker::create(UserRole::ADMINISTRATOR);
        $now  = time();

        $data = ['email' => $user->email, 'password' => UserRole::ADMINISTRATOR . UserRole::ADMINISTRATOR];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));

        $responseBody = json_decode((string) $f3->get('RESPONSE'), true, 512, JSON_THROW_ON_ERROR);
        $accessToken  = $responseBody['session']['accessToken'] ?? null;
        $expiresAt    = $responseBody['session']['expiresAt'] ?? null;
        $tokenParts   = \is_string($accessToken) ? explode('.', $accessToken) : [];
        $payload      = [];

        if (3 === \count($tokenParts)) {
            $decodedPayload = base64_decode(strtr($tokenParts[1], '-_', '+/') . str_repeat('=', (4 - mb_strlen($tokenParts[1]) % 4) % 4), true);
            if (false !== $decodedPayload) {
                $payload = json_decode($decodedPayload, true, 512, JSON_THROW_ON_ERROR);
            }
        }

        $test->expect(isset($responseBody['user']) && $responseBody['user']['id'] === $user->id, 'Login returns the authenticated user payload');
        $test->expect(($responseBody['session']['tokenType'] ?? null) === 'Bearer', 'Login returns a bearer token type');
        $test->expect(\is_string($accessToken) && 3 === \count($tokenParts), 'Login returns a JWT access token');
        $test->expect(isset($payload['sub']) && (int) $payload['sub'] === (int) $user->id, 'JWT subject matches the authenticated user');
        $test->expect(isset($payload['exp']) && \is_string($expiresAt) && strtotime($expiresAt) > $now, 'JWT expiry is set in the future');
        $test->expect(isset($responseBody['session']['expiresAt']) && $responseBody['session']['expiresAt'] === $expiresAt, 'Login returns a concrete token expiration date');
        $test->expect(null !== \Registry::get('session')->get('user'), 'JWT session keeps the authenticated user in memory');

        UserFaker::logout();

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidAuthentication($f3)
    {
        $test = $this->newTest();

        $user = UserFaker::create(UserRole::ADMINISTRATOR);
        $data = ['email' => $user->email, 'password' => UserRole::ADMINISTRATOR . UserRole::ADMINISTRATOR];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect(null !== \Registry::get('session')->get('user'), 'User with id "' . $user->id . '" is now logged in');

        return $test->results();
    }
}
