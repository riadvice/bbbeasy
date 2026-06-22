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

use Fake\PresetSettingFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * Class PresetSettingTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class PresetSettingTest extends Scenario
{
    protected $group = 'Preset Setting Model';

    /**
     * @return array
     */
    public function testPresetSettingCreation()
    {
        $test                    = $this->newTest();
        $faker                   = Faker::create();
        $presetSettings          = new PresetSetting();
        $presetSettings->group   = $faker->name;
        $presetSettings->name    = $faker->name;
        $presetSettings->enabled = true;
        $presetSettings->save();

        $test->expect(0 !== $presetSettings->id, 'Preset setting mocked & saved to the database');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetByGroup()
    {
        $test          = $this->newTest();
        $presetSetting = PresetSettingFaker::create();

        $test->expect($presetSetting->getByGroup($presetSetting->group)->group === $presetSetting->group, 'getByGroup(' . $presetSetting->group . ') found preset setting');
        $test->expect(!$presetSetting->getByGroup('404')->id, 'getByGroup(404) did not find preset setting');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetByName()
    {
        $test          = $this->newTest();
        $presetSetting = PresetSettingFaker::create();

        $test->expect($presetSetting->getByName($presetSetting->name)->name === $presetSetting->name, 'getByName(' . $presetSetting->name . ') found preset setting');
        $test->expect(!$presetSetting->getByName('404')->id, 'getByName(404) did not find preset setting');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetAllPresets()
    {
        $test          = $this->newTest();
        $presetSetting = new PresetSetting();
        $presetSetting->erase(['']); // Cleaning the table for test.
        $presetSetting1 = PresetSettingFaker::create();
        $presetSetting2 = PresetSettingFaker::create();
        $data1          = [
            'id'      => $presetSetting1->id,
            'group'   => $presetSetting1->group,
            'name'    => $presetSetting1->name,
            'enabled' => $presetSetting1->enabled,
        ];
        $data2 = [
            'id'      => $presetSetting2->id,
            'group'   => $presetSetting2->group,
            'name'    => $presetSetting2->name,
            'enabled' => $presetSetting2->enabled,
        ];
        $data = [$data1, $data2];

        $test->expect($data === $presetSetting->getAll(), 'getAll() returned all preset settings');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testCollectAll()
    {
        $test          = $this->newTest();
        $presetSetting = new PresetSetting();
        $presetSetting->erase(['']); // Cleaning the table for test.
        $presetSetting1 = PresetSettingFaker::create('group1');
        $presetSetting2 = PresetSettingFaker::create('group1');
        $presetSetting3 = PresetSettingFaker::create('group2');
        $data1          = [
            'name'          => $presetSetting1->group,
            'subcategories' => [
                ['name' => $presetSetting1->name, 'enabled' => $presetSetting1->enabled],
                ['name' => $presetSetting2->name, 'enabled' => $presetSetting2->enabled],
            ],
        ];
        $data2 = [
            'name'          => $presetSetting3->group,
            'subcategories' => [
                ['name' => $presetSetting3->name, 'enabled' => $presetSetting3->enabled],
            ],
        ];
        $data = [$data1, $data2];

        $test->expect($data === $presetSetting->collectAll(), 'collectAll() returned all preset settings informations');

        $test->expect($data1 === $presetSetting->getCategoryInfos($presetSetting1->group), 'getCategoryInfos(' . $presetSetting1->group . ') returned all category informations');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testSaveDefaultPresetSettings()
    {
        $test          = $this->newTest();
        $presetSetting = new PresetSetting();
        $presetSetting->erase(['']); // Cleaning the table for test.

        $settings = $presetSetting->getDefaultPresetSettings(true);
        $presetSetting->savePresetSettings($settings);

        $lastSetting = new PresetSetting();
        $lastSetting->load(['id = ?', $presetSetting->lastInsertId()]);
        $lastSetting->enabled = false;
        $lastSetting->save();

        $test->expect(54 === \count($presetSetting->getAll()), 'All Default preset settings mocked & saved to the database');

        return $test->results();
    }
}
