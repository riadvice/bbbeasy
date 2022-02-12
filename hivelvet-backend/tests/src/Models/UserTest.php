<?php

declare(strict_types=1);

/*
 * Hivelvet open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * Hivelvet is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with Hivelvet; if not, see <http://www.gnu.org/licenses/>.
 */

namespace Models;

use Base;
use Faker\Factory as Faker;
use Registry;
use Test\Scenario;

/**
 * Class UserTest.
 *
 * @internal
 * @coversNothing
 */
final class UserTest extends Scenario
{
    protected $group = 'User Model';

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testPasswordHash($f3)
    {
        $test           = $this->newTest();
        $faker          = Faker::create();
        $password       = 'secure_password';
        $user           = new User();
        $user->username = $faker->userName;
        $user->password = $password;

        $test->expect(password_verify(trim($password), $user->password), 'User password is hashed correctly');

        return $test->results();
    }

    /**
     * @param \Base $f3
     *
     * @return array
     */
    public function testUserCreation($f3)
    {
        $test           = $this->newTest();
        $faker          = Faker::create();
        $user           = new User(Registry::get('db'));
        $user->username = $faker->userName;
        $user->email    = $faker->email;
        $user->password = $faker->password(8);
        $user->save();

        $test->expect(0 !== $user->id, 'User mocked & saved to the database');

        return $test->results();
    }
}
