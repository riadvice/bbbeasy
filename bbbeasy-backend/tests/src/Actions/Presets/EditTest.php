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
final class EditTest extends Scenario
{
    final protected const EDIT_PRESET_SUB_CATEG_ROUTE = 'PUT /presets/subcategories/';
    final protected const EDIT_PRESET_ROUTE           = 'PUT /presets/';
    protected $group                                  = 'Action Preset Edit';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testEmptyName($f3)
    {
        $test = $this->newTest();

        $preset = PresetFaker::create(UserFaker::create());
        $data   = ['data' => ['name' => '']];
        $f3->mock(self::EDIT_PRESET_ROUTE . $preset->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/empty_error.json'), 'Update existing preset with id "' . $preset->id . '" using an empty name show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingPreset($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $data  = ['data' => ['name' => $faker->name]];
        $f3->mock(self::EDIT_PRESET_ROUTE . 404, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Update non existing preset with id "404" show an error');

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

        $user    = UserFaker::create(UserRole::LECTURER);
        $preset1 = PresetFaker::create($user);
        $preset2 = PresetFaker::create($user);
        $data    = ['data' => ['name' => $preset1->name]];

        $f3->mock(self::EDIT_PRESET_ROUTE . $preset2->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('preset/exist_error.json'), 'Update existing preset with id "' . $preset2->id . '" using an existing name "' . $preset1->name . '" show an error');

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

        $preset = PresetFaker::create(UserFaker::create());
        $faker  = Faker::create();
        $data   = ['data' => ['name' => $faker->name]];
        $f3->mock(self::EDIT_PRESET_ROUTE . $preset->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'preset' => $preset->getMyPresetInfos($preset)]), 'Update existing preset with id "' . $preset->id . '" using new name "' . $preset->name . '"');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testEditSubCategNonExistingPreset($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $data  = ['data' => [], 'title' => $faker->name];
        $f3->mock(self::EDIT_PRESET_SUB_CATEG_ROUTE . 404, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Update settings for non existing preset with id "404" show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testEditSubCategValidPreset($f3)
    {
        $test = $this->newTest();

        $preset = PresetFaker::create(UserFaker::create());
        $data   = [
            'data' => [
                ['name' => 'users_join_muted', 'type' => 'bool', 'value' => true],
                ['name' => 'moderators_allowed_to_unmute_users', 'type' => 'bool', 'value' => ''],
            ],
            'title' => 'Audio',
        ];
        $f3->mock(self::EDIT_PRESET_SUB_CATEG_ROUTE . $preset->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'preset' => $preset->getMyPresetInfos($preset)]), 'Update settings for existing preset with id "' . $preset->id . '" pass successfully');

        return $test->results();
    }
}
