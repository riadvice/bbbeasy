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

namespace Actions\Account;

use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 * @coversNothing
 */
final class GetResetPasswordTokenTest extends Scenario
{
    final protected const CHECK_TOKEN_ROUTE = 'GET /account/reset-token/';
    protected $group                        = 'Action Get Reset Password Token';

    /**
     * @param $f3
     *
     * @throws \JsonException
     */
    public function testRequestInvalidResetPasswordToken($f3): array
    {
        $test = $this->newTest();
        $f3->mock(self::CHECK_TOKEN_ROUTE . Faker::create()->md5);
        $test->expect($this->compareTemplateToResponse('account/password_reset_token_error.json'), 'Fetch data for a non existing password reset token');

        // @todo: test a valid token for a non-active user

        return $test->results();
    }
}
