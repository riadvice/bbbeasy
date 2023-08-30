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

namespace Actions\Presets;

use Enum\UserRole;
use Faker\Factory as Faker;
use Models\User;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class IndexTest extends Scenario
{
    final protected const LIST_PRESETS_ROUTE = 'GET /presets/';
    protected $group                         = 'Action Preset Index Presets';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testCollect($f3)
    {
        $test = $this->newTest();

        $faker  = Faker::create();
        $user   = new User();
        $result = $user->saveUserWithDefaultPreset(
            $faker->userName,
            $faker->email,
            $faker->password(8),
            UserRole::LECTURER_ID,
            'User successfully added',
            'User could not be added',
        );
        $test->expect($result, 'User with id "' . $user->id . '" saved to the database with default preset');

        $f3->mock(self::LIST_PRESETS_ROUTE . $user->id);
        json_decode($f3->get('RESPONSE'));
        $test->expect(JSON_ERROR_NONE === json_last_error(), 'Collect presets of user with id "' . $user->id . '"');

        return $test->results();
    }
}
