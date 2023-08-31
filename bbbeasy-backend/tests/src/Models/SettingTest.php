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

use Faker\Factory as Faker;
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
     * @return array
     */
    public function testGetAllSettings()
    {
        $test    = $this->newTest();
        $setting = new Setting();

        $test->expect(10 === \count($setting->getAllSettings()), 'getAllSettings() returned all settings');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testSaveSettings()
    {
        $test    = $this->newTest();
        $faker   = Faker::create();
        $setting = new Setting();

        /** @var Setting $settings */
        $settings = $setting->find([], ['limit' => 1])->current();

        $settings->saveSettings(
            $settings->company_name,
            $settings->company_website,
            $settings->platform_name,
            $faker->url,
            'policy updated',
            'logo-1.png',
            ['primary_color' => '#006644'],
            true,
            true
        );
        $settings->save();

        $test->expect('policy updated' === $settings->privacy_policy && 'logo-1.png' === $settings->logo && '#006644' === $settings->primary_color, 'saveSettings() updated setting with given params');

        return $test->results();
    }
}
