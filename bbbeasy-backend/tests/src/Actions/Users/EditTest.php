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
use Enum\UserStatus;
use Fake\UserFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class EditTest extends Scenario
{
    final protected const EDIT_USER_ROUTE = 'PUT /users/';
    protected $group                      = 'Action User Edit';

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

        $user = UserFaker::create(UserRole::LECTURER);
        $data = ['data' => ['username' => '', 'email' => '', 'password' => '', 'role' => '']];
        $f3->mock(self::EDIT_USER_ROUTE . $user->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/empty_error.json'), 'Update existing user with id "' . $user->id . '" using an empty data shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     * @throws \JsonException
     */
    public function testExistingUser($f3)
    {
        $test = $this->newTest();

        $userLecturer1 = UserFaker::create(UserRole::LECTURER);
        $userLecturer2 = UserFaker::create(UserRole::LECTURER);
        $userLecturer3 = UserFaker::create(UserRole::LECTURER);

        $data = ['data' => ['username' => $userLecturer1->username, 'email' => $userLecturer1->email, 'role' => UserRole::LECTURER_ID, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . $userLecturer3->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/update_exist_error.json'), 'Update existing user with id "' . $userLecturer3->id . '" using an existing username "' . $userLecturer1->username . '" and an existing email "' . $userLecturer1->email . '" shown an error');

        $data = ['data' => ['username' => $userLecturer1->username, 'email' => $userLecturer2->email, 'role' => UserRole::LECTURER_ID, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . $userLecturer3->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/update_exist_error.json'), 'Update existing user with id "' . $userLecturer3->id . '" using an existing username "' . $userLecturer1->username . '" and an existing email "' . $userLecturer2->email . '" shown an error');

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

        $userLecturerOne = UserFaker::create(UserRole::LECTURER);
        $userLecturerTwo = UserFaker::create(UserRole::LECTURER);
        $data            = ['data' => ['username' => $userLecturerOne->username, 'email' => $userLecturerTwo->email, 'role' => UserRole::LECTURER_ID, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . $userLecturerTwo->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/update_exist_username_error.json'), 'Update existing user with id "' . $userLecturerTwo->id . '" using an existing username "' . $userLecturerOne->username . '" shown an error');

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

        $userLecturerOne = UserFaker::create(UserRole::LECTURER);
        $userLecturerTwo = UserFaker::create(UserRole::LECTURER);
        $data            = ['data' => ['username' => $userLecturerTwo->username, 'email' => $userLecturerOne->email, 'role' => UserRole::LECTURER_ID, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . $userLecturerTwo->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/update_exist_email_error.json'), 'Update existing user with id "' . $userLecturerTwo->id . '" using an existing email "' . $userLecturerOne->email . '" shown an error');

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
        $user  = UserFaker::create(UserRole::LECTURER);
        $data  = ['data' => ['username' => $faker->userName, 'email' => $faker->email, 'role' => UserRole::NON_EXISTING_ID, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . $user->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Update existing user with id "' . $user->id . '" using non existing role "' . UserRole::NON_EXISTING_ID . '" shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingUser($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $data  = ['data' => ['username' => $faker->userName, 'email' => $faker->email, 'role' => UserRole::LECTURER_ID, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . UserRole::NON_EXISTING_ID, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Update non existing user with id "' . UserRole::NON_EXISTING_ID . '" show an error');

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
        $test  = $this->newTest();
        $faker = Faker::create();

        $userLecturer = UserFaker::create(UserRole::LECTURER);
        $data         = ['data' => ['username' => $faker->userName, 'email' => $faker->email, 'role' => UserRole::LECTURER_ID, 'status' => UserStatus::INACTIVE]];
        $f3->mock(self::EDIT_USER_ROUTE . $userLecturer->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'user' => $userLecturer->getUserInfos()]), 'Update existing user with id "' . $userLecturer->id . '" using new email "' . $userLecturer->email . '" and new username "' . $userLecturer->username . '" successfully');

        return $test->results();
    }
}
