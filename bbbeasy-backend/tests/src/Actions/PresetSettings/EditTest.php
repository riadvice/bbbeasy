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

namespace Actions\PresetSettings;

use Faker\Factory as Faker;
use Models\PresetSetting;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class EditTest extends Scenario
{
    final protected const EDIT_PRESET_SETTINGS_ROUTE = 'PUT /preset_settings';
    protected $group                                 = 'Action Preset Settings Edit';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingCategory($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $data  = ['data' => [], 'category' => $faker->name];
        $f3->mock(self::EDIT_PRESET_SETTINGS_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Update preset settings for non existing category with name "' . $data['category'] . '" show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidData($f3)
    {
        $test = $this->newTest();

        $presetSetting = new PresetSetting();
        $data          = [
            'data' => [
                ['name' => 'users_join_muted', 'enabled' => false],
                ['name' => 'moderators_allowed_to_unmute_users', 'enabled' => false],
                ['name' => 'auto_join', 'enabled' => false],
                ['name' => 'listen_only_enabled', 'enabled' => false],
                ['name' => 'skip_echo_test', 'enabled' => false],
            ],
            'category' => 'Audio',
        ];
        $f3->mock(self::EDIT_PRESET_SETTINGS_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'settings' => $presetSetting->getCategoryInfos($data['category'])]), 'Update existing preset setting for existing category with name "' . $data['category'] . '" pass successfully');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testDisabledCategoryValidData($f3)
    {
        $test = $this->newTest();

        $presetSetting = new PresetSetting();
        $data          = [
            'data' => [
                ['name' => 'users_join_muted', 'enabled' => true],
                ['name' => 'moderators_allowed_to_unmute_users', 'enabled' => false],
                ['name' => 'auto_join', 'enabled' => false],
                ['name' => 'listen_only_enabled', 'enabled' => false],
                ['name' => 'skip_echo_test', 'enabled' => true],
            ],
            'category' => 'Audio',
        ];
        $f3->mock(self::EDIT_PRESET_SETTINGS_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'settings' => $presetSetting->getCategoryInfos($data['category'])]), 'Update existing preset setting for disabled category with name "' . $data['category'] . '" pass successfully');

        return $test->results();
    }
}
