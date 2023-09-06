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
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class RegisterTest extends Scenario
{
    final protected const REGISTER_ROUTE = 'POST /account/register';
    protected $group                     = 'Action User Register';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \JsonException
     */
    public function testRegistrationInvalidUser($f3)
    {
        $test  = $this->newTest();
        $faker = Faker::create();

        $data = [
            'username'        => '',
            'email'           => '',
            'password'        => '',
            'confirmPassword' => '',
            'agreement'       => '',
        ];
        $f3->mock(self::REGISTER_ROUTE, null, null, $this->postJsonData(['data' => $data]));
        $test->expect($this->compareTemplateToResponse('account/registration_error.json'), 'Register with empty data show an error');

        $data = [
            'username'        => 'user',
            'email'           => $faker->firstName,
            'password'        => $faker->password(3),
            'confirmPassword' => $faker->password(4),
            'agreement'       => false,
        ];
        $f3->mock(self::REGISTER_ROUTE, null, null, $this->postJsonData(['data' => $data]));
        $test->expect($this->compareTemplateToResponse('account/registration_error.json'), 'Register with too short username and password, invalid email and passwords not matching show an error');

        $data = [
            'username'        => $faker->userName,
            'email'           => $faker->email,
            'password'        => 'password',
            'confirmPassword' => 'password',
            'agreement'       => true,
        ];
        $f3->mock(self::REGISTER_ROUTE, null, null, $this->postJsonData(['data' => $data]));
        $test->expect($this->compareTemplateToResponse('account/registration_invalid_error.json'), 'Register with a common password show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \JsonException
     */
    public function testRegistrationValidUser($f3)
    {
        $test        = $this->newTest();
        $faker       = Faker::create();
        $rawPassword = $faker->password(8);
        $data        = [
            'username'        => $faker->userName,
            'email'           => $faker->email,
            'password'        => $rawPassword,
            'confirmPassword' => $rawPassword,
            'agreement'       => true,
        ];
        $f3->mock(self::REGISTER_ROUTE, null, null, $this->postJsonData(['data' => $data]));
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Register with a valid credentials');

        return $test->results();
    }
}
