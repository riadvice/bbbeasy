<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
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
use DB\SQL\Session as SQLSession;
use Log\LogWriterTrait;
use Models\User;
use Session as F3Session;

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
     * @var SQLSession
     */
    private $internalSession;

    /**
     * Session constructor.
     *
     * @param string $table
     * @param bool   $force
     * @param null   $onsuspect
     * @param null   $key
     */
    public function __construct(SQL $db = null, $table = 'sessions', $force = false, $onsuspect = null, $key = null)
    {
        $this->f3 = \Base::instance();
        $this->initLogger();
        if ('CACHE' === $table) {
            $this->internalSession = new F3Session(function(F3Session $session, $id) {
                // Suspect session
                if (($ip = $session->ip()) !== $this->f3->get('IP')) {
                    $this->logger->warning('user changed IP:' . $ip);
                } else {
                    $this->logger->warning('user changed browser/device:' . $this->f3->get('AGENT'));
                }

                // The default behaviour destroys the suspicious session.
                return true;
            }, $key);
        } else {
            $this->internalSession = new SQLSession($db, $table, $force, function($session) {
                // Suspect session
                if (($ip = $session->ip()) !== $this->f3->get('IP')) {
                    $this->logger->warning('user changed IP:' . $ip);
                } else {
                    $this->logger->warning('user changed browser/device:' . $this->f3->get('AGENT'));
                }

                // The default behaviour destroys the suspicious session.
                return true;
            }, $key);
        }
    }

    public function cleanupOldSessions(): void
    {
        $this->logger->notice('Cleaning up old sessions');
        $this->cleanup(\ini_get('session.gc_maxlifetime'));
    }

    public function exists($key): bool
    {
        return $this->internalSession->exists($key);
    }

    public function set($key, $value): void
    {
        $this->f3->set('SESSION.' . $key, $value);
        $this->f3->sync('SESSION');
    }

    /**
     * @param mixed $key
     *
     * @return mixed
     */
    public function get($key)
    {
        return $this->f3->get('SESSION.' . $key);
    }

    /**
     *    Garbage collector.
     *
     * @param $max int
     */
    public function cleanup($max): bool
    {
        return $this->internalSession->cleanup($max);
    }

    public function isLoggedIn(): bool
    {
        return true === $this->get('user.loggedIn');
    }

    /**
     * @param $user User
     */
    public function authorizeUser(User $user): void
    {
        $this->set('user.id', $user->id);
        $this->set('user.role', $user->role->name);
        $this->set('user.roleId', $user->role->id);
        $this->set('user.username', $user->username);
        $this->set('user.email', $user->email);
        $this->set('user.loggedIn', true);
        $this->logger->debug("User with id {$user->id} is now logged in");
    }

    /**
     * @param $user User
     */
    public function updateUser(User $user): void
    {
        $this->set('user.username', $user->username);
        $this->set('user.email', $user->email);
        $this->logger->debug("User with id {$user->id} is now updated");
    }

    /**
     * Clean all information in the session to mark the user as logged out.
     */
    public function revokeUser(): void
    {
        // Backup settings
        $theme        = $this->get('theme');
        $locale       = $this->get('locale');
        $organisation = $this->get('organisation');

        $this->logger->debug('Logging out user with id ' . $this->get('user.id'));
        $this->f3->clear('SESSION');

        // Revert back settings
        $this->set('theme', $theme);
        $this->set('locale', $locale);
        $this->set('organisation', $organisation);
    }

    public function getRole(): string
    {
        return $this->get('user.role') ?: '';
    }

    public function getRoleId(): int
    {
        return $this->get('user.roleId') ?: 0;
    }

    /**
     * @param mixed $role
     *
     * @return bool
     */
    public function isRole($role)
    {
        if (\is_string($role)) {
            return $role === $this->getRole();
        }
        if (\is_array($role)) {
            return \in_array($this->getRole(), $role, true);
        }
        $this->logger->emergency('Cannot test user role on object typed with ' . \gettype($role));
    }

    /**
     *  Generates a CSRF Token and stores it in the Session.
     *
     * @return string
     */
    public function generateToken()
    {
        $token = $this->internalSession->csrf();
        $this->set('csrf_token', $token);
        $this->set('csrf_used', false);

        return $token;
    }

    /**
     * @return null|string
     */
    public function sid()
    {
        return $this->internalSession->sid();
    }

    /**
     *  Compares the given token with the value in the Session.
     *
     * @return bool
     */
    public function validateToken()
    {
        $errors = [];
        if (!$this->get('csrf_token') || $this->get('csrf_used')) {
            $tokenIsValid = $errors['csrf_token'] = 'CSRF token used or not set';
        } else {
            $this->set('csrf_used', true);
            $tokenIsValid = $this->f3->get($this->f3->get('VERB') . '.csrf_token') === $this->get('csrf_token');
            if (!$tokenIsValid) {
                $this->logger->critical(
                    'Invalid request token provided ' .
                                        $this->f3->get($this->f3->get('VERB') . '.csrf_token') .
                                        ' where it should be ' . $this->get('csrf_token')
                );
                $errors['csrf_token'] = 'Invalid CSRF token';
            }
        }

        return $tokenIsValid;
    }
}
