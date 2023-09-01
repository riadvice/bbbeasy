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

use Enum\UserStatus;
use Faker\Factory as Faker;
use Models\ResetPasswordToken;
use Models\User;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class GetResetPasswordTokenTest extends Scenario
{
    final protected const CHECK_TOKEN_ROUTE = 'GET /account/reset-token/';
    protected $group                        = 'Action Get Reset Password Token';

    /**
     * @param mixed $f3
     *
     * @throws \JsonException
     */
    public function testRequestInvalidResetPasswordToken($f3): array
    {
        $test = $this->newTest();
        $f3->mock(self::CHECK_TOKEN_ROUTE . Faker::create()->md5);

        $test->expect($this->compareTemplateToResponse('account/password_reset_token_error.json'), 'Fetch data for a non existing password reset token');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @throws \JsonException
     */
    public function testRequestNonActiveUser($f3): array
    {
        $test      = $this->newTest();
        $lastToken = new ResetPasswordToken();
        $user      = new User();
        $lastToken->load(['id = ?', $lastToken->lastInsertId()]);
        $user->load(['id = ?', $lastToken->user_id]);
        $user->status = UserStatus::INACTIVE;
        $user->save();
        $f3->mock(self::CHECK_TOKEN_ROUTE . $lastToken->token);

        $test->expect($this->compareTemplateToResponse('account/password_reset_token_user_error.json'), 'Fetch data for a non active user reset token');

        $user->status = UserStatus::ACTIVE;
        $user->save();

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @throws \JsonException
     */
    public function testRequestValidResetPasswordToken($f3): array
    {
        $test      = $this->newTest();
        $lastToken = new ResetPasswordToken();
        $lastToken->load(['id = ?', $lastToken->lastInsertId()]);
        $f3->mock(self::CHECK_TOKEN_ROUTE . $lastToken->token);

        $test->expect($this->compareArrayToResponse(['token' => $lastToken->token]), 'Fetch data for a valid password reset token');

        return $test->results();
    }
}
