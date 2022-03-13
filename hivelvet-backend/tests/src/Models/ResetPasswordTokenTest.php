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

use Enum\UserRole;
use Fake\UserFaker;
use Test\Scenario;

/**
 * Class UserTest.
 *
 * @internal
 * @coversNothing
 */
final class ResetPasswordTokenTest extends Scenario
{
    protected $group = 'Reset Password Token Model';

    /**
     * @param $f3
     *
     * @throws \ReflectionException
     *
     * @return array
     */
    public function testTokenCreation($f3)
    {
        $user = UserFaker::create(UserRole::ADMINISTRATOR);

        $test                = $this->newTest();
        $resetToken          = new ResetPasswordToken();
        $resetToken->user_id = $user->id;
        $resetToken->insert();
        $test->expect($resetToken->isUsable(), 'Newly inserted password reset token is usable');

        return $test->results();
    }
}
