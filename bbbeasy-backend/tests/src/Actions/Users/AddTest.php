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

namespace Actions\Users;

use Enum\UserRole;
use Fake\UserFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class AddTest extends Scenario
{
    final protected const ADD_USER_ROUTE = 'POST /users';
    protected $group                     = 'Action User Add';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testEmptyData($f3)
    {
        $test = $this->newTest();

        $data = ['data' => ['username' => '', 'email' => '', 'password' => '', 'role' => '']];
        $f3->mock(self::ADD_USER_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/empty_error.json'), 'Add user with an empty data shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testExistingUser($f3)
    {
        $test = $this->newTest();

        $user = UserFaker::create(UserRole::LECTURER);
        $data = ['data' => ['username' => $user->username, 'email' => $user->email, 'password' => UserRole::LECTURER, 'role' => UserRole::LECTURER_ID]];
        $f3->mock(self::ADD_USER_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/exist_error.json'), 'Add user with existing username "' . $user->username . '" and existing email "' . $user->email . '" shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testExistingUsername($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $user  = UserFaker::create(UserRole::LECTURER);
        $data  = ['data' => ['username' => $user->username, 'email' => $faker->email, 'password' => $faker->password(8), 'role' => UserRole::LECTURER_ID]];
        $f3->mock(self::ADD_USER_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/exist_username_error.json'), 'Add user with an existing username "' . $user->username . '" shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testExistingEmail($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $user  = UserFaker::create(UserRole::LECTURER);
        $data  = ['data' => ['username' => $faker->userName, 'email' => $user->email, 'password' => $faker->password(8), 'role' => UserRole::LECTURER_ID]];
        $f3->mock(self::ADD_USER_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/exist_email_error.json'), 'Add user with an existing email "' . $user->email . '" shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingRole($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $data  = ['data' => ['username' => $faker->userName, 'email' => $faker->email, 'password' => $faker->password(8), 'role' => UserRole::NON_EXISTING_ID]];
        $f3->mock(self::ADD_USER_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Add user with non existing role "' . UserRole::NON_EXISTING_ID . '" shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidUser($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $data  = ['data' => ['username' => $faker->userName, 'email' => $faker->email, 'password' => $faker->password(8), 'role' => UserRole::LECTURER_ID]];
        $f3->mock(self::ADD_USER_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Add user with a valid data');

        return $test->results();
    }
}
