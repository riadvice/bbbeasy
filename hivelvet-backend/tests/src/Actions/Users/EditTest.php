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

namespace Actions\Users;

use Enum\UserRole;
use Enum\UserStatus;
use Fake\UserFaker;
use Faker\Factory as Faker;
use ReflectionException;
use Test\Scenario;

/**
 * @internal
 * @coversNothing
 */
final class EditTest extends Scenario
{
    final protected const EDIT_USER_ROUTE = 'PUT /users/edit/';
    protected $group                      = 'Action User Edit';

    /**
     * @param $f3
     *
     * @throws ReflectionException
     * @throws \JsonException
     *
     * @return array
     */
    public function testExistingUser($f3)
    {
        $test = $this->newTest();

        $userLecturerOne = UserFaker::create(UserRole::LECTURER);
        $userLecturerTwo = UserFaker::create(UserRole::LECTURER);
        $data            = ['data' => ['username' => $userLecturerOne->username, 'email' => $userLecturerOne->email, 'role' => 2, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . $userLecturerTwo->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/update_exist_error.json'), 'Update user with existing username and email shown an error');

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testExistingUsername($f3)
    {
        $test = $this->newTest();

        $userLecturerOne = UserFaker::create(UserRole::LECTURER);
        $userLecturerTwo = UserFaker::create(UserRole::LECTURER);
        $data            = ['data' => ['username' => $userLecturerOne->username, 'email' => $userLecturerTwo->email, 'role' => 2, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . $userLecturerTwo->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/update_exist_username_error.json'), 'Update user with existing username shown an error');

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testExistingEmail($f3)
    {
        $test = $this->newTest();

        $userLecturerOne = UserFaker::create(UserRole::LECTURER);
        $userLecturerTwo = UserFaker::create(UserRole::LECTURER);
        $data            = ['data' => ['username' => $userLecturerTwo->username, 'email' => $userLecturerOne->email, 'role' => 2, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . $userLecturerTwo->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/update_exist_email_error.json'), 'Update user with existing email shown an error');

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testValidUser($f3)
    {
        $test  = $this->newTest();
        $faker = Faker::create();

        $userLecturer = UserFaker::create(UserRole::LECTURER);
        $data         = ['data' => ['username' => $faker->userName, 'email' => $faker->email, 'role' => 2, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . $userLecturer->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'user' => $userLecturer->getUserInfos($userLecturer->id)]), 'Update existing user with id "' . $userLecturer->id . '" using new email  "' . $userLecturer->email . '" and new username "' . $userLecturer->username . '" successfully');

        return $test->results();
    }
}
