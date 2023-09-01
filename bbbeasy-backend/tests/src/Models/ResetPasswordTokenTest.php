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
use Fake\ResetPasswordTokenFaker;
use Fake\UserFaker;
use Test\Scenario;

/**
 * Class ResetPasswordTokenTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class ResetPasswordTokenTest extends Scenario
{
    protected $group = 'Reset Password Token Model';

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testTokenCreation()
    {
        $test       = $this->newTest();
        $user       = UserFaker::create(UserRole::ADMINISTRATOR);
        $resetToken = new ResetPasswordToken();

        $resetToken->user_id = $user->id;
        $userId              = $resetToken->user_id;
        $resetToken->insert();

        $test->expect($resetToken->isUsable(), 'Newly inserted password reset token is usable with user id = ' . $userId);
        $test->expect($resetToken->userExists($userId), 'userExists(' . $userId . ') exists');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testUserExists()
    {
        $user = UserFaker::create(UserRole::ADMINISTRATOR);

        $test       = $this->newTest();
        $resetToken = ResetPasswordTokenFaker::create($user);

        $test->expect($resetToken->isUsable(), 'Newly inserted password reset token is usable with token = ' . $resetToken->token);
        $test->expect($resetToken->getByToken($resetToken->token)->token === $resetToken->token, 'getByToken(' . $resetToken->token . ') found password reset token');
        $test->expect($resetToken->getByToken('404')->token === $resetToken->token, 'getByToken("404") did not find password reset token');

        return $test->results();
    }
}
