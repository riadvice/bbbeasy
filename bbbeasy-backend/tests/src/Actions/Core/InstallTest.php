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

namespace Actions\Core;

use Enum\UserRole;
use Fake\UserFaker;
use Faker\Factory as Faker;
use Models\Label;
use Models\Preset;
use Models\PresetSetting;
use Models\ResetPasswordToken;
use Models\Role;
use Models\RolePermission;
use Models\Room;
use Models\RoomLabel;
use Models\User;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class InstallTest extends Scenario
{
    final protected const COLLECT_USERS_ROUTE = 'POST /collect-users';
    final protected const INSTALL_ROUTE       = 'POST /install';
    protected $group                          = 'Action Core Install Process';

    /**
     * @param $f3 \Base
     *
     * @return array
     */
    public function testInstallWithEmptyAdminData($f3)
    {
        $test = $this->newTest();
        $data = [
            'data' => [
                'username' => '',
                'email'    => '',
                'password' => '',
            ],
        ];
        $f3->mock(self::COLLECT_USERS_ROUTE, null, null, $this->postJsonData($data));

        $test->expect($this->compareTemplateToResponse('user/empty_error.json'), 'Install with an empty user data shown an error');

        return $test->results();
    }

    /**
     * @param $f3 \Base
     *
     * @return array
     */
    public function testInstallWithCommonPassword($f3)
    {
        $test  = $this->newTest();
        $faker = Faker::create();
        $data  = [
            'data' => [
                'username' => $faker->userName,
                'email'    => $faker->email,
                'password' => 'password',
            ],
        ];
        $f3->mock(self::COLLECT_USERS_ROUTE, null, null, $this->postJsonData($data));

        $test->expect($this->compareTemplateToResponse('core/invalid_error.json'), 'Install with an invalid user data shown an error');

        return $test->results();
    }

    /**
     * @param $f3 \Base
     *
     * @return array
     */
    public function testInstallWithExistingData($f3)
    {
        $test  = $this->newTest();
        $faker = Faker::create();
        $user  = UserFaker::create();
        $data  = [
            'data' => [
                'username' => $user->username,
                'email'    => $user->email,
                'password' => $faker->password(8),
            ],
        ];
        $f3->mock(self::COLLECT_USERS_ROUTE, null, null, $this->postJsonData($data));

        $test->expect($this->compareTemplateToResponse('core/exist_error.json'), 'Install with an existing username or email shown an error');

        return $test->results();
    }

    /**
     * @param $f3 \Base
     *
     * @return array
     */
    public function testInstallWithEmptyData($f3)
    {
        $test      = $this->newTest();
        $roomLabel = new RoomLabel();
        $room      = new Room();
        $label     = new Label();

        $presetSetting = new PresetSetting();
        $preset        = new Preset();

        $rolePermission = new RolePermission();
        $role           = new Role();

        $resetToken = new ResetPasswordToken();
        $user       = new User();

        // Cleaning tables for test.
        $roomLabel->erase(['']);
        $room->erase(['']);
        $label->erase(['']);

        $presetSetting->erase(['']);
        $preset->erase(['']);

        $rolePermission->erase(['']);
        $role->erase(['id NOT IN (?,?)', UserRole::ADMINISTRATOR_ID, UserRole::LECTURER_ID]);

        $resetToken->erase(['']);
        $user->erase(['']);

        $data = [
            'data' => [
                'username'        => '',
                'email'           => '',
                'password'        => '',
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
                'presetsConfig' => [],
            ],
        ];
        $f3->mock(self::INSTALL_ROUTE, null, null, $this->postJsonData($data));

        $test->expect($this->compareTemplateToResponse('core/empty_error.json'), 'Install with an empty data shown an error');

        return $test->results();
    }

    /**
     * @param $f3 \Base
     *
     * @return array
     */
    public function testInstallWithValidData($f3)
    {
        $test          = $this->newTest();
        $faker         = Faker::create();
        $presetSetting = new PresetSetting();
        $data          = [
            'data' => [
                'username'        => $faker->userName,
                'email'           => $faker->email,
                'password'        => $faker->password(8),
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
                'presetsConfig' => $presetSetting->getDefaultPresetSettings(true),
            ],
        ];
        $f3->mock(self::INSTALL_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('core/invalid_format_error.json'), 'Install with an invalid file format shown an error');

        $data['data']['logo'] = 'logo-1.png';
        $f3->mock(self::INSTALL_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Install with valid data has been successfully passed');

        return $test->results();
    }
}
