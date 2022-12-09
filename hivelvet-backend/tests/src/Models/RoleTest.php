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
use Enum\UserRole;
use Fake\RoleFaker;
use Faker\Factory as Faker;
use Registry;
use Test\Scenario;

/**
 * Class RoleTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class RoleTest extends Scenario
{
    protected $group = 'Role Model';

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testGetLecturerRole($f3)
    {
        $test = $this->newTest();
        $role = new Role(Registry::get('db'));
        $role->load(['id = ?', 2]);
        $data = [
            'key'         => $role->id,
            'name'        => $role->name,
            'users'       => $role->getRoleUsers(),
            'permissions' => $role->getRolePermissions(),
        ];

        $test->expect(empty(array_udiff($data, $role->getLecturerRole(), fn($obj1, $obj2) => $obj1 === $obj2)), 'getLecturerRole() found lecturer role');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testGetAdministratorRole($f3)
    {
        $test = $this->newTest();
        $role = new Role(Registry::get('db'));
        $role->load(['id = ?', 1]);
        $data = [
            'key'         => $role->id,
            'name'        => $role->name,
            'users'       => $role->getRoleUsers(),
            'permissions' => $role->getRolePermissions(),
        ];

        $test->expect(empty(array_udiff($data, $role->getAdministratorRole(), fn($obj1, $obj2) => $obj1 === $obj2)), 'getAdministratorRole() found administrator role');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testRoleCreation($f3)
    {
        $test       = $this->newTest();
        $faker      = Faker::create();
        $role       = new Role(Registry::get('db'));
        $role->name = $faker->name;
        $role->save();

        $test->expect(0 !== $role->id, 'Role mocked and saved to the database');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testNameFormatting($f3)
    {
        $test       = $this->newTest();
        $role       = new Role(Registry::get('db'));
        $role->name = 'roleRole';
        $role->save();

        $test->expect(0 !== $role->id, 'Role mocked and saved to the database');
        $test->expect('role_role' === $role->name, 'Name formatted to ' . $role->name);

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testNameExists($f3)
    {
        $test = $this->newTest();
        $role = RoleFaker::create();

        $test->expect($role->nameExists($role->name), 'nameExists(' . $role->name . ') exists');
        $test->expect(!$role->nameExists('404'), 'nameExists("404") does not exist');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     *
     * @throws \Exception
     */
    public function testSwitchAllRoleUsers($f3)
    {
        $test   = $this->newTest();
        $faker  = Faker::create();
        $role   = RoleFaker::create();
        $roleId = $role->id;

        $user           = new User(Registry::get('db'));
        $user->username = $faker->userName;
        $user->email    = $faker->email;
        $user->password = $faker->password(8);
        $user->role_id  = $roleId;
        $user->save();
        $role->delete();

        $test->expect(!$role->load(['id = ?', $roleId]), 'Role with id "' . $roleId . '" deleted from DB and these users are switched to the lecturer role');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testCollectAllRolesAndGetAllRoles($f3)
    {
        $test       = $this->newTest();
        $resetToken = new ResetPasswordToken();
        $user       = new User(Registry::get('db'));
        $role       = new Role(Registry::get('db'));
        $resetToken->erase(['']); // Cleaning the table for test.
        $user->erase(['']); // Cleaning the table for test.
        $role->erase(['id NOT IN (?,?)', UserRole::ADMINISTRATOR_ID, UserRole::LECTURER_ID]); // Cleaning the table for test.

        $role1       = RoleFaker::create();
        $role2       = RoleFaker::create();
        $dataCollect = [
            ['id' => UserRole::ADMINISTRATOR_ID, 'name' => UserRole::ADMINISTRATOR],
            ['id' => UserRole::LECTURER_ID, 'name' => UserRole::LECTURER],
            ['id' => $role1->id, 'name' => $role1->name],
            ['id' => $role2->id, 'name' => $role2->name],
        ];
        $dataGet = [
            $role->getAdministratorRole(),
            $role->getLecturerRole(),
            $role1->getRoleInfos(),
            $role2->getRoleInfos(),
        ];

        $test->expect($dataCollect === $role->collectAll(), 'collectAllRoles() returned all roles names');
        $test->expect(empty(array_diff($dataGet, $role->getAllRoles())), 'getAllRoles() returned all roles informations');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testGetRoleInfos($f3)
    {
        $test = $this->newTest();
        $role = RoleFaker::create();
        $data = [
            'key'         => $role->id,
            'name'        => $role->name,
            'users'       => $role->getRoleUsers(),
            'permissions' => $role->getRolePermissions(),
        ];

        $test->expect(empty(array_udiff($data, $role->getRoleInfos(), fn($obj1, $obj2) => $obj1 === $obj2)), 'getRoleInfos() returned role informations');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testGetRoleUsers($f3)
    {
        $test  = $this->newTest();
        $faker = Faker::create();
        $role  = RoleFaker::create();

        $user           = new User(Registry::get('db'));
        $user->username = $faker->userName;
        $user->email    = $faker->email;
        $user->password = $faker->password(8);
        $user->role_id  = $role->id;
        $user->save();

        $test->expect(1 === $role->getRoleUsers(), 'getRoleUsers() returned count of users with this role');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testSaveRoleAndPermissions($f3)
    {
        $test       = $this->newTest();
        $data       = ['labels' => ['add', 'delete', 'edit']];
        $role       = new Role(Registry::get('db'));
        $role->name = 'labels manager';
        $result     = $role->saveRoleAndPermissions($data);

        $test->expect(true === $result, 'saveRoleAndPermissions() add role permissions');
        $test->expect($data === $role->getRolePermissions(), 'getRolePermissions() returned role permissions');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     *
     * @throws \Exception
     */
    public function testDeleteRole($f3)
    {
        $test       = $this->newTest();
        $faker      = Faker::create();
        $data       = ['labels' => ['add', 'delete', 'edit']];
        $role       = new Role(Registry::get('db'));
        $role->name = $faker->name;
        $role->saveRoleAndPermissions($data);
        $roleId = $role->id;
        $role->delete();

        $test->expect(!$role->load(['id = ?', $roleId]), 'Role with id "' . $roleId . '" deleted from DB');

        return $test->results();
    }
}
