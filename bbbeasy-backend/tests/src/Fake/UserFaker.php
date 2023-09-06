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

namespace Fake;

use Enum\UserRole;
use Enum\UserStatus;
use Faker\Factory as Faker;
use models\User;

class UserFaker
{
    private static array $storage = [];

    /**
     * @param null $role
     * @param null $storageName
     *
     * @return User
     *
     * @throws \ReflectionException
     */
    public static function create($role = null, string $status = UserStatus::ACTIVE, $storageName = null)
    {
        // To make testing easier, the user is password is the same as its role
        $faker          = Faker::create();
        $user           = new User();
        $userEmail      = $faker->email;
        $user->email    = $userEmail;
        $user->username = $faker->userName;

        // pick a random role if not provided
        if (null === $role) {
            $roles = UserRole::values();
            foreach ($roles as $key => $value) {
                if ('string' !== \gettype($value)) {
                    unset($roles[$key]);
                }
            }
            $roleKey = array_rand($roles);
            $role    = $roles[$roleKey];
        }

        $user->role_id  = UserRole::LECTURER_ID;
        $user->password = $role;
        if (UserRole::ADMINISTRATOR === $role) {
            $user->role_id  = UserRole::ADMINISTRATOR_ID;
            $user->password = $role . $role;
        }
        $user->status = $status;

        $user->save();
        if (null !== $storageName) {
            self::$storage[$storageName] = $user;
        }

        return $user->getByEmail($userEmail);
    }

    /**
     * Creates a user and authenticates it.
     *
     * @param string $status
     * @param null   $storageName
     * @param mixed  $role
     *
     * @return User
     *
     * @throws \ReflectionException
     */
    public static function createAndLogin($role, $status = UserStatus::ACTIVE, $storageName = null)
    {
        $user = self::create($role, $status, $storageName);

        self::loginUser($user);

        return $user;
    }

    /**
     * @param User $user
     */
    public static function loginUser($user): void
    {
        $password = $role = $user->role;
        if (UserRole::ADMINISTRATOR === $role) {
            $password = $role . $role;
        }
        \Base::instance()->mock('POST /account/login', [
            'email'    => $user->email,
            'password' => $password,
        ]);
    }

    public static function logout(): void
    {
        \Base::instance()->mock('GET /account/logout');
    }

    /**
     * @param mixed $storageName
     *
     * @return User
     */
    public static function get($storageName)
    {
        return self::$storage[$storageName];
    }
}
