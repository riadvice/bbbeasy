<?php

/**
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

use Models\PresetCategory;
use Phinx\Migration\AbstractMigration;

class AddPresetCategoriesTable extends AbstractMigration
{
    public function up(): void
    {
        $categoriesTable = $this->table('preset_categories');
        $categoriesData = [
            [
                'name'          => 'General',
                'icon'          => 'GlobalOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'Security',
                'icon'          => 'SafetyOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'Recording',
                'icon'          => 'PlayCircleOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'Breakout rooms',
                'icon'          => 'DeploymentUnitOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],

            [
                'name'          => 'Webcams',
                'icon'          => 'VideoCameraOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'Screenshare',
                'icon'          => 'DesktopOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'Branding',
                'icon'          => 'BgColorsOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'Audio',
                'icon'          => 'AudioOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],

            [
                'name'          => 'Language',
                'icon'          => 'TranslationOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'Whiteboard',
                'icon'          => 'FundProjectionScreenOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'Lock settings',
                'icon'          => 'UnlockOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'Layout',
                'icon'          => 'LayoutOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],

            [
                'name'          => 'Guest policy',
                'icon'          => 'CoffeeOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'Learning anaytics dashboard',
                'icon'          => 'FundViewOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'User experience',
                'icon'          => 'SmileOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'          => 'ZcaleRight Load Balancer',
                'icon'          => 'ZcaleRight',
                'created_on'    => date('Y-m-d H:i:s')
            ]
        ];
        $categoriesTable->insert($categoriesData)->save();
    }

    public function down(): void
    {
        $categoriesTable = $this->table('preset_categories');
        $categoriesTable->getAdapter()->execute("DELETE from preset_categories");
    }
}

