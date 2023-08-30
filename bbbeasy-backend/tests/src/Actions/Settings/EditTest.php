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

namespace Actions\Settings;

use Faker\Factory as Faker;
use Models\Setting;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class EditTest extends Scenario
{
    final protected const EDIT_SETTINGS_ROUTE = 'PUT /settings';
    protected $group                          = 'Action Setting Edit';

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

        $data = ['data' => [
            'company_name'    => '',
            'company_url'     => '',
            'platform_name'   => '',
            'term_url'        => '',
            'policy_url'      => '',
            'logo'            => '',
            'branding_colors' => [
                'primary_color'   => '',
                'secondary_color' => '',
                'accent_color'    => '',
                'add_color'       => '',
            ],
        ]];
        $f3->mock(self::EDIT_SETTINGS_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('setting/empty_error.json'), 'Update existing settings using an empty data show an error');

        return $test->results();
    }

    public function testValidData($f3)
    {
        $test = $this->newTest();

        $faker   = Faker::create();
        $setting = new Setting();
        $data    = ['data' => [
            'company_name'    => $faker->name,
            'company_url'     => $faker->url,
            'platform_name'   => $faker->name,
            'term_url'        => $faker->url,
            'policy_url'      => $faker->url,
            'logo'            => 'logo-1.doc',
            'branding_colors' => [
                'primary_color'   => $faker->safeHexColor,
                'secondary_color' => $faker->safeHexColor,
                'accent_color'    => $faker->safeHexColor,
                'add_color'       => $faker->safeHexColor,
            ],
        ]];
        $f3->mock(self::EDIT_SETTINGS_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('core/invalid_format_error.json'), 'Update existing settings with an invalid file format shown an error');

        $data['data']['logo'] = 'logo-1.png';
        $f3->mock(self::EDIT_SETTINGS_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'settings' => $setting->getAllSettings()]), 'Update existing settings using a valid data pass successfully');

        return $test->results();
    }
}
