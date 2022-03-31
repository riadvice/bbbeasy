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

namespace Actions\Roles;

use Fake\RoleFaker;
use ReflectionException;
use Test\Scenario;

/**
 * @internal
 * @coversNothing
 */
final class EditTest extends Scenario
{
    final protected const EDIT_ROLE_ROUTE = 'PUT /roles/edit/';
    protected $group                      = 'Action Role Edit';

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testEmptyName($f3)
    {
        $test = $this->newTest();

        $role = RoleFaker::create();
        $data = ['data' => ['name' => '']];
        $f3->mock(self::EDIT_ROLE_ROUTE . $role->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/empty_error.json'), 'Update role with empty name show an error');

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testExistingName($f3)
    {
        $test = $this->newTest();

        $faker_1 = RoleFaker::create();
        $faker_2 = RoleFaker::create();
        $data    = ['data' => ['name' => $faker_2->name]];
        $f3->mock(self::EDIT_ROLE_ROUTE . $faker_1->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/exist_error.json'), 'Update role with existing name show an error');

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testValidRole($f3)
    {
        $test = $this->newTest();

        $role = RoleFaker::create();
        $data = ['data' => ['name' => 'Rooms manager']];
        $f3->mock(self::EDIT_ROLE_ROUTE . $role->id, null, null, $this->postJsonData($data));
        $result = [
            'key'         => $role->id,
            'name'        => $role->name,
            'users'       => $role->getRoleUsers(),
            'permissions' => $role->getRolePermissions(),
        ];
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'role' => $result]), 'Update role pass successfully with id "' . $role->id . '"');

        return $test->results();
    }
}
