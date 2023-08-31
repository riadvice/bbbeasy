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

use Fake\UserFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class ResetPasswordTest extends Scenario
{
    final protected const RESET_ROUTE = 'POST /account/reset-password';
    protected $group                  = 'Action Reset Password';

    /**
     * @param mixed $f3
     *
     * @throws \JsonException
     */
    public function testRequestEmptyEmail($f3): array
    {
        $test = $this->newTest();
        $f3->mock(self::RESET_ROUTE, null, null, $this->postJsonData(['email' => '']));

        $test->expect($this->compareTemplateToResponse('account/password_reset_empty_error.json'), 'Reset password for an empty user email show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @throws \JsonException
     */
    public function testRequestInvalidEmail($f3): array
    {
        $test  = $this->newTest();
        $faker = Faker::create();
        $f3->mock(self::RESET_ROUTE, null, null, $this->postJsonData(['email' => $faker->email]));

        $test->expect($this->compareTemplateToResponse('account/password_reset_error.json'), 'Reset password for a non existing user email show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @throws \JsonException
     */
    public function testRequestValidEmail($f3): array
    {
        $test = $this->newTest();
        $user = UserFaker::create();
        $f3->mock(self::RESET_ROUTE, null, null, $this->postJsonData(['email' => $user->email]));

        $test->expect($this->compareArrayToResponse(['message' => 'Please check your email to reset your password']), 'Send an email to the user to reset her password');

        return $test->results();
    }
}
