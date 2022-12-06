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

use Base;
use Faker\Factory as Faker;
use Registry;
use Test\Scenario;

/**
 * Class SettingTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class SettingTest extends Scenario
{
    protected $group = 'Setting Model';

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testGetAllSettings($f3)
    {
        $test    = $this->newTest();
        $setting = new Setting(Registry::get('db'));

        $test->expect(10 === \count($setting->getAllSettings()), 'getAllSettings() returned all settings');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testSaveSettings($f3)
    {
        $test    = $this->newTest();
        $faker   = Faker::create();
        $setting = new Setting(Registry::get('db'));

        /** @var Setting $settings */
        $settings = $setting->find([], ['limit' => 1])->current();

        $settings->saveSettings(
            $settings->company_name,
            $settings->company_website,
            $settings->platform_name,
            $faker->name,
            'policy updated',
            ['primary_color' => '#006644']
        );
        $settings->save();

        $test->expect('policy updated' === $settings->privacy_policy, 'saveSettings() updated setting with given params');

        return $test->results();
    }
}
