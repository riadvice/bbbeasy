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
     * @param \Base $f3
     *
     * @return array
     */
    public function testPresetSettingCreation($f3)
    {
        $test                    = $this->newTest();
        $faker                   = Faker::create();
        $presetSettings          = new PresetSetting(\Registry::get('db'));
        $presetSettings->group   = $faker->name;
        $presetSettings->name    = $faker->name;
        $presetSettings->enabled = true;
        $presetSettings->save();

        $test->expect(0 !== $presetSettings->id, 'Preset setting mocked & saved to the database');

        return $test->results();
    }

    /**
     * @param \Base $f3
     *
     * @return array
     */
    public function testGetByGroup($f3)
    {
        $test          = $this->newTest();
        $presetSetting = PresetSettingFaker::create();

        $test->expect($presetSetting->getByGroup($presetSetting->group)->group === $presetSetting->group, 'getByGroup(' . $presetSetting->group . ') found preset setting');
        $test->expect(!$presetSetting->getByGroup('404')->id, 'getByGroup(404) did not find preset setting');

        return $test->results();
    }

    /**
     * @param \Base $f3
     *
     * @return array
     */
    public function testGetByName($f3)
    {
        $test          = $this->newTest();
        $presetSetting = PresetSettingFaker::create();

        $test->expect($presetSetting->getByName($presetSetting->name)->name === $presetSetting->name, 'getByName(' . $presetSetting->name . ') found preset setting');
        $test->expect(!$presetSetting->getByName('404')->id, 'getByName(404) did not find preset setting');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testGetAllPresets($f3)
    {
        $test          = $this->newTest();
        $presetSetting = new PresetSetting(\Registry::get('db'));
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

        $test->expect($data === $presetSetting->getAllPresets(), 'getAllPresets() returned all preset settings');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testSaveDefaultPresetSettings($f3)
    {
        $test          = $this->newTest();
        $presetSetting = new PresetSetting(\Registry::get('db'));
        $presetSetting->erase(['']); // Cleaning the table for test.

        $settings = $presetSetting->getDefaultPresetSettings(true);
        $presetSetting->savePresetSettings($settings);

        $lastSetting = new PresetSetting();
        $lastSetting->load(['id = ?', $presetSetting->lastInsertId()]);
        $lastSetting->enabled = false;
        $lastSetting->save();

        $test->expect(54 === \count($presetSetting->getAllPresets()), 'All Default preset settings mocked & saved to the database');

        return $test->results();
    }
}
