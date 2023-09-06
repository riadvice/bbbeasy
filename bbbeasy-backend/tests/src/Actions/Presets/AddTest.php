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
use Fake\PresetFaker;
use Fake\UserFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class AddTest extends Scenario
{
    final protected const ADD_PRESET_ROUTE = 'POST /presets';
    protected $group                       = 'Action Preset Add';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testEmptyData($f3)
    {
        $test = $this->newTest();

        $data = ['data' => ['name' => ''], 'user_id' => ''];
        $f3->mock(self::ADD_PRESET_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('preset/empty_error.json'), 'Add preset with an empty data shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingUser($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $data  = ['data' => ['name' => $faker->name], 'user_id' => 404];
        $f3->mock(self::ADD_PRESET_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Add preset with non existing user id "404" shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testExistingName($f3)
    {
        $test = $this->newTest();

        $user1  = UserFaker::create(UserRole::LECTURER);
        $user2  = UserFaker::create(UserRole::LECTURER);
        $preset = PresetFaker::create($user1);

        $data = ['data' => ['name' => $preset->name], 'user_id' => $user1->id];
        $f3->mock(self::ADD_PRESET_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('preset/exist_error.json'), 'Add preset with an existing name "' . $preset->name . '" to user "' . $user1->id . '" shown an error');

        $data = ['data' => ['name' => $preset->name], 'user_id' => $user2->id];
        $f3->mock(self::ADD_PRESET_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Add preset with an existing name "' . $preset->name . '" to another user "' . $user2->id . '" pass');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidPreset($f3)
    {
        $test = $this->newTest();

        $user  = UserFaker::create(UserRole::LECTURER);
        $faker = Faker::create();
        $data  = ['data' => ['name' => $faker->name], 'user_id' => $user->id];
        $f3->mock(self::ADD_PRESET_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Add preset with a valid data');

        return $test->results();
    }
}
