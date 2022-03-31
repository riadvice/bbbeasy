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
use Fake\UserFaker;
use ReflectionException;
use Test\Scenario;

/**
 * @internal
 * @coversNothing
 */
final class AddTest extends Scenario
{
    final protected const ADD_USER_ROUTE = 'POST /users/add';
    protected $group                     = 'Action User Add';

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testExistingUser($f3)
    {
        $test = $this->newTest();

        $user = UserFaker::create(UserRole::LECTURER);
        $data = ['data' => ['username' => $user->username, 'email' => $user->email, 'password' => UserRole::LECTURER,  'role' => 2]];
        $f3->mock(self::ADD_USER_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/exist_error.json'),'Add user with existing username and email shown an error');

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

        $user = UserFaker::create(UserRole::LECTURER);
        $data = ['data' => ['username' => $user->username, 'email' => 'email@gmail.com', 'password' => UserRole::LECTURER,  'role' => 2]];
        $f3->mock(self::ADD_USER_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/exist_username_error.json'),'Add user with existing username shown an error');

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

        $user = UserFaker::create(UserRole::LECTURER);
        $data = ['data' => ['username' => 'test', 'email' => $user->email, 'password' => UserRole::LECTURER,  'role' => 2]];
        $f3->mock(self::ADD_USER_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('user/exist_email_error.json'),'Add user with existing email shown an error');

        return $test->results();
    }
}
