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

namespace Models;

use Enum\UserRole;
use Enum\UserStatus;
use Fake\UserFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * Class UserTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class UserTest extends Scenario
{
    protected $group = 'User Model';

    /**
     * @return array
     */
    public function testPasswordHash()
    {
        $test           = $this->newTest();
        $faker          = Faker::create();
        $password       = 'secure_password';
        $user           = new User();
        $user->username = $faker->userName;
        $user->password = $password;

        $test->expect($user->verifyPassword($password), 'User password is hashed correctly');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testUserCreation()
    {
        $test           = $this->newTest();
        $faker          = Faker::create();
        $user           = new User();
        $user->username = $faker->userName;
        $user->email    = $faker->email;
        $user->password = $faker->password(8);
        $user->role_id  = UserRole::LECTURER_ID;
        $user->save();

        $test->expect(0 !== $user->id, 'User mocked & saved to the database');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testSaveUserWithDefaultPreset()
    {
        $test   = $this->newTest();
        $faker  = Faker::create();
        $user   = new User();
        $result = $user->saveUserWithDefaultPreset(
            $faker->userName,
            $faker->email,
            $faker->password(8),
            UserRole::ADMINISTRATOR_ID,
            'User successfully added',
            'User could not be added',
        );

        $test->expect($result, 'User mocked & saved to the database with default preset');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testGetByEmail()
    {
        $test = $this->newTest();
        $user = UserFaker::create();

        $test->expect($user->getByEmail($user->email)->email === $user->email, 'getByEmail(' . $user->email . ') found user');
        $test->expect(!$user->getByEmail('404')->email, 'getById("404") did not find user');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetById()
    {
        $test = $this->newTest();
        $user = UserFaker::create();

        $test->expect($user->getById($user->id)->id === $user->id, 'getById(' . $user->id . ') found user');
        $test->expect(!$user->getById(404)->id, 'getById(404) did not find user');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testAdminExists()
    {
        $test = $this->newTest();
        $user = new User();

        $test->expect($user->adminUserExists(), 'adminUserExists() check if administrator account exists or not');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testEmailExists()
    {
        $test = $this->newTest();
        $user = UserFaker::create();

        $test->expect($user->emailExists($user->email), 'nameExists(' . $user->email . ') exists');
        $test->expect(!$user->emailExists($user->email, $user->id), 'nameExists(' . $user->email . ',' . $user->id . ') does not exist');
        $test->expect(!$user->emailExists('404'), 'nameExists("404") does not exist');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testUsernameExists()
    {
        $test = $this->newTest();
        $user = UserFaker::create();

        $test->expect($user->usernameExists($user->username), 'usernameExists(' . $user->username . ') exists');
        $test->expect(!$user->usernameExists($user->username, $user->id), 'usernameExists(' . $user->username . ',' . $user->id . ') does not exist');
        $test->expect(!$user->usernameExists('404'), 'usernameExists("404") does not exist');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testGetUsersByUsernameOrEmail()
    {
        $test  = $this->newTest();
        $user  = new User();
        $user1 = UserFaker::create();
        $user2 = UserFaker::create();
        $data  = [
            ['email' => $user1->email, 'username' => $user1->username],
            ['email' => $user2->email, 'username' => $user2->username],
        ];

        $test->expect($data === $user->getUsersByUsernameOrEmail($user1->username, $user2->email), 'getUsersByUsernameOrEmail(' . $user1->username . ',' . $user2->email . ') returned all users with username ' . $user1->username . ' and email ' . $user2->email);
        $test->expect('Username and Email already exist' === $user->userExists($user1->username, $user2->email, $data), 'userExists(' . $user1->username . ',' . $user2->email . ') exists');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testUserExists()
    {
        $test = $this->newTest();
        $user = UserFaker::create();

        $test->expect('Username and Email already exist' === $user->userExists(
            $user->username,
            $user->email,
            $user->getUsersByUsernameOrEmail($user->username, $user->email),
        ), 'userExists(' . $user->username . ',' . $user->email . ') exists');
        $test->expect('Username already exists' === $user->userExists(
            $user->username,
            '404',
            $user->getUsersByUsernameOrEmail($user->username, '404'),
        ), 'userExists(' . $user->username . ',"404") exists');
        $test->expect('Email already exists' === $user->userExists(
            '404',
            $user->email,
            $user->getUsersByUsernameOrEmail('404', $user->email),
        ), 'userExists("404",' . $user->email . ') exists');
        $test->expect(null === $user->userExists(
            '404',
            '404',
            $user->getUsersByUsernameOrEmail('404', '404'),
        ), 'userExists("404","404") does not exist');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testGetAllUsers()
    {
        $test   = $this->newTest();
        $preset = new Preset();
        $user   = new User();
        $preset->erase(['']); // Cleaning the table for test.
        $user->erase(['']); // Cleaning the table for test.
        $user1 = UserFaker::create();
        $user2 = UserFaker::create();
        $user3 = UserFaker::create();
        $data  = [$user1->getUserInfos(), $user2->getUserInfos(), $user3->getUserInfos()];

        $test->expect($data === $user->getAllUsers(), 'getAllUsers() returned all users informations');
        $test->expect(3 === $user->countActiveUsers(), 'countActiveUsers() returned number of active users = ' . \count($data));
        $test->expect(2 === $user->countActiveUsers([$user1->id, $user2->id]), 'countActiveUsers([' . $user1->id . ',' . $user2->id . ']) returned number of active users in given users array');
        $test->expect(1 === $user->countActiveUsers([$user1->id]), 'countActiveUsers([' . $user1->id . ']) returned number of active users in given users array');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testGetUserInfos()
    {
        $test = $this->newTest();

        $user = UserFaker::create();
        $room = new Room();
        $data = [
            'key'      => $user->id,
            'username' => $user->username,
            'email'    => $user->email,
            'status'   => $user->status,
            'role'     => $user->role->name,
            'nb_rooms' => \count($room->collectAllByUserId($user->id)),
        ];

        $test->expect($data === $user->getUserInfos(), 'getUserInfos() returned user informations with id = ' . $user->id);

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \Exception
     */
    public function testDeleteRole()
    {
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $userId = $user->id;

        $test->expect(0 !== $userId, 'User with id "' . $userId . '" mocked & saved to the database');

        $user->delete();
        $user->load(['id = ?', $userId]);
        $test->expect(UserStatus::DELETED === $user->status, 'User with id "' . $userId . '" updated with state ' . $user->status . ' in DB');

        return $test->results();
    }
}
