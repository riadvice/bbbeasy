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

namespace Actions\Account;

use Faker\Factory as Faker;
use Models\ResetPasswordToken;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class ChangePasswordTest extends Scenario
{
    final protected const CHANGE_ROUTE = 'POST /account/change-password';
    protected $group                   = 'Action Change Password';

    /**
     * @param mixed $f3
     *
     * @throws \JsonException
     */
    public function testRequestEmptyData($f3): array
    {
        $test = $this->newTest();
        $data = [
            'password' => '',
            'token'    => '',
        ];
        $f3->mock(self::CHANGE_ROUTE, null, null, $this->postJsonData($data));

        $test->expect($this->compareTemplateToResponse('account/password_change_empty_error.json'), 'Change password for an empty user data show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @throws \JsonException
     */
    public function testRequestInvalidToken($f3): array
    {
        $test  = $this->newTest();
        $faker = Faker::create();
        $data  = [
            'password' => $faker->password(8),
            'token'    => $faker->md5,
        ];
        $f3->mock(self::CHANGE_ROUTE, null, null, $this->postJsonData($data));

        $test->expect($this->compareTemplateToResponse('account/password_change_error.json'), 'Change password for a non existing reset password token show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @throws \JsonException
     */
    public function testRequestInvalidUserData($f3): array
    {
        $test      = $this->newTest();
        $lastToken = new ResetPasswordToken();
        $lastToken->load(['id = ?', $lastToken->lastInsertId()]);
        $data = [
            'password' => 'password',
            'token'    => $lastToken->token,
        ];
        $f3->mock(self::CHANGE_ROUTE, null, null, $this->postJsonData($data));

        $test->expect($this->compareTemplateToResponse('account/password_change_invalid_error.json'), 'Change password with invalid data show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @throws \JsonException
     */
    public function testRequestValidUserData($f3): array
    {
        $test      = $this->newTest();
        $faker     = Faker::create();
        $lastToken = new ResetPasswordToken();
        $lastToken->load(['id = ?', $lastToken->lastInsertId()]);
        $data = [
            'password' => $faker->password(8),
            'token'    => $lastToken->token,
        ];
        $f3->mock(self::CHANGE_ROUTE, null, null, $this->postJsonData($data));

        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Change user password successfully done');

        return $test->results();
    }
}
