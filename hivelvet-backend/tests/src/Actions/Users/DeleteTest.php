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
use ReflectionException;
use Test\Scenario;

/**
 * @internal
 * @coversNothing
 */
final class DeleteTest extends Scenario
{
    final protected const DELETE_USER_ROUTE = 'DELETE /users/delete/';
    protected $group                     = 'Action User Delete';

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testValidUser($f3)
    {
        $test = $this->newTest();

        $user = UserFaker::create(UserRole::LECTURER);
        $test->expect($user->valid(), 'User mocked & saved to the database');

        $f3->mock(self::DELETE_USER_ROUTE . $user->id, null, null);
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'user' => $user->getUserInfos($user->id)]), 'Delete user pass successfully with id "' . $user->id . '"');

        return $test->results();
    }
}
