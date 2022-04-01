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

namespace Actions\Account;

use Enum\UserRole;
use Enum\UserStatus;
use Fake\UserFaker;
use Faker\Factory as Faker;
use Models\User;
use ReflectionException;
use Test\Scenario;

/**
 * @internal
 * @coversNothing
 */
final class LoginTest extends Scenario
{
    final protected const LOGIN_ROUTE = 'POST /account/login';
    protected $group                  = 'Action User Login';

    /**
     * @param $f3
     *
     * @throws \JsonException
     *
     * @return array
     */
    public function testAuthenticateInvalidUser($f3)
    {
        $test  = $this->newTest();
        $faker = Faker::create();

        $data = ['email' => $faker->email, 'password' => $faker->password(8)];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_error.json'), 'Login with non existing credentials shows error');

        $data = ['email' => $faker->firstName, 'password' => $faker->password(8)];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_error.json'), 'Login with invalid email format show an error');

        $data = ['email' => $faker->email, 'password' => $faker->password(3)];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_error.json'), 'Login with too short password');

        $data = ['email' => $faker->firstName, 'password' => $faker->password(3)];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('account/authentication_error.json'), 'Login with too short password and invalid email');

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testAuthenticateExistingUser($f3)
    {
        $test = $this->newTest();
        $user = UserFaker::create(UserRole::ADMINISTRATOR);

        $data = ['email' => $user->email, 'password' => UserRole::ADMINISTRATOR . UserRole::ADMINISTRATOR];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));
        $test->expect(
            $this->compareArrayToResponse(['username' => $user->username, 'email' => $user->email, 'role' => $user->role->name]),
            'Login with user "' . $user->email . '" with status ' . $user->status
        );

        // $test->expect($this->reroutedTo('dashboard'), 'Login with correct credentials rerouted to dashboard');
        $test->expect($f3->exists('SESSION.user'), 'Sessions is aware that the user us logged in');

        UserFaker::logout();

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws \JsonException
     *
     * @return array
     */
    public function testAuthenticateExistingInactiveUser($f3)
    {
        $test           = $this->newTest();
        $faker          = Faker::create();
        $raw_password   = $faker->password(8);
        $status         = UserStatus::INACTIVE;
        $user           = new User();
        $user->email    = $faker->email;
        $user->username = $faker->userName;
        $user->password = $raw_password;
        $user->status   = $status;
        $user->save();

        $data = ['email' => $user->email, 'password' => $raw_password];
        $f3->mock(self::LOGIN_ROUTE, null, null, $this->postJsonData($data));

        $test->expect($this->compareTemplateToResponse('account/authentication_error.json'), 'Login with correct credentials and "' . $status . '" status');

        return $test->results();
    }
}
