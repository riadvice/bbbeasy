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
use Fake\RoleFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * Class UserTest.
 *
 * @internal
 * @coversNothing
 */
final class RoleTest extends Scenario
{
    final protected const ADD_ROLE_ROUTE    = 'POST /roles/add';
    final protected const EDIT_ROLE_ROUTE   = 'PUT /roles/edit/';
    final protected const DELETE_ROLE_ROUTE = 'DELETE /roles/delete/';

    protected $group = 'Role Model';

    /**
     * @param \Base $f3
     *
     * @return array
     */
    public function testRoleCreation($f3)
    {
        $test   = $this->newTest();

        $role = RoleFaker::create();
        $test->expect($role->valid(), 'Role mocked & saved to the database');

        $data = ['data' => ['name' => '']];
        $f3->mock(self::ADD_ROLE_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/empty_error.json'), 'Add role with empty name show an error');

        $data = ['data' => ['name' => $role->name]];
        $f3->mock(self::ADD_ROLE_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/exist_error.json'), 'Add role with existing name show an error');

        return $test->results();
    }

    /**
     * @param \Base $f3
     *
     * @return array
     */
    public function testRoleUpdate($f3)
    {
        $test   = $this->newTest();

        $role = RoleFaker::create();
        $test->expect($role->valid(), 'Role mocked & saved to the database');

        $role2 = RoleFaker::create();
        $test->expect($role2->valid(), 'Role 2 mocked & saved to the database');

        $data = ['data' => ['name' => '']];
        $f3->mock(self::EDIT_ROLE_ROUTE.$role->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/empty_error.json'), 'Update role with empty name show an error');

        $data = ['data' => ['name' => $role2->name]];
        $f3->mock(self::EDIT_ROLE_ROUTE.$role->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/exist_error.json'), 'Update role with existing name show an error');

        $data = ['data' => ['name' => 'Rooms manager']];
        $f3->mock(self::EDIT_ROLE_ROUTE.$role->id, null, null, $this->postJsonData($data));
        $result = [
            'key'         => $role->id,
            'name'        => $role->name,
            'users'       => $role->getRoleUsers(),
            'permissions' => $role->getRolePermissions(),
        ];
        $test->expect($this->compareArrayToResponse(['result' => 'success','role' => $result]), 'Update role pass successfully with id "'.$role->id.'"');

        return $test->results();
    }


    /**
     * @param \Base $f3
     *
     * @return array
     */
    public function testRoleDelete($f3)
    {
        $test   = $this->newTest();

        $role = RoleFaker::create();
        $test->expect($role->valid(), 'Role mocked & saved to the database with id = '.$role->id.'"');

        $f3->mock(self::DELETE_ROLE_ROUTE.$role->id);
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Delete role pass successfully with id = '.$role->id.'"');

        return $test->results();
    }
}
