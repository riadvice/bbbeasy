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

namespace Actions\Roles;

use Enum\UserRole;
use Fake\RoleFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class EditTest extends Scenario
{
    final protected const EDIT_ROLE_ROUTE = 'PUT /roles/';
    protected $group                      = 'Action Role Edit';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testEmptyName($f3)
    {
        $test = $this->newTest();

        $role = RoleFaker::create();
        $data = ['data' => ['name' => '']];
        $f3->mock(self::EDIT_ROLE_ROUTE . $role->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/empty_error.json'), 'Update existing role with id "' . $role->id . '" using an empty name show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testExistingName($f3)
    {
        $test = $this->newTest();

        $roleOne = RoleFaker::create();
        $roleTwo = RoleFaker::create();
        $data    = ['data' => ['name' => $roleTwo->name]];
        $f3->mock(self::EDIT_ROLE_ROUTE . $roleOne->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/exist_error.json'), 'Update existing role with id "' . $roleOne->id . '" using an existing name "' . $roleTwo->name . '" show an error');

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
        $data  = ['data' => ['name' => $faker->name]];
        $f3->mock(self::EDIT_ROLE_ROUTE . UserRole::NON_EXISTING_ID, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Edit non existing role with id "' . UserRole::NON_EXISTING_ID . '" show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidRole($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $role  = RoleFaker::create();
        $data  = ['data' => [
            'name'        => $faker->name,
            'permissions' => [
                'labels' => ['add', 'delete', 'edit'],
            ],
        ]];
        $f3->mock(self::EDIT_ROLE_ROUTE . $role->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'role' => $role->getRoleInfos()]), 'Update existing role with id "' . $role->id . '" using new name "' . $role->name . '" and new permissions successfully');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidRoleAndNewPermissions($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $role  = RoleFaker::create(['users' => ['index', 'edit', 'delete']]);
        $data  = ['data' => [
            'name'        => $faker->name,
            'permissions' => [
                'labels' => ['edit', 'add'],
                'users'  => ['index', 'add', 'edit'],
            ],
        ]];

        $f3->mock(self::EDIT_ROLE_ROUTE . $role->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'role' => $role->getRoleInfos()]), 'Update existing role with id "' . $role->id . '" using new name "' . $role->name . '" and updated permissions successfully');

        return $test->results();
    }
}
