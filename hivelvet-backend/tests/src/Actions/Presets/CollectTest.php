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

namespace Actions\Presets;

use Enum\UserRole;
use Faker\Factory as Faker;
use Models\User;
use ReflectionException;
use Registry;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class CollectTest extends Scenario
{
    final protected const COLLECT_PRESETS_ROUTE = 'GET /presets/collect/';
    protected $group                            = 'Action Preset Collect Presets';

    /**
     * @param $f3
     *
     * @return array
     *
     * @throws ReflectionException
     */
    public function testCollect($f3)
    {
        $test = $this->newTest();

        $faker  = Faker::create();
        $user   = new User(Registry::get('db'));
        $result = $user->saveUserWithDefaultPreset(
            $faker->userName,
            $faker->email,
            $faker->password(8),
            UserRole::LECTURER_ID,
            'User successfully added',
            'User could not be added',
        );
        $test->expect(true === $result, 'User with id "' . $user->id . '" saved to the database with default preset');

        $f3->mock(self::COLLECT_PRESETS_ROUTE . $user->id);
        json_decode($f3->get('RESPONSE'));
        $test->expect(JSON_ERROR_NONE === json_last_error(), 'Collect presets of user with id "' . $user->id . '"');

        return $test->results();
    }
}
