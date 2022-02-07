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
                'name'      => 'Global',
                'icon'          => 'GlobalOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'Security',
                'icon'          => 'SafetyOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'Recording',
                'icon'          => 'PlayCircleOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'Breakout rooms',
                'icon'          => 'DeploymentUnitOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],

            [
                'name'      => 'Webcams',
                'icon'          => 'VideoCameraOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'Screenshare',
                'icon'          => 'DesktopOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'Branding',
                'icon'          => 'BgColorsOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'Audio',
                'icon'          => 'AudioOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],

            [
                'name'      => 'Localisation',
                'icon'          => 'TranslationOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'Whiteboard',
                'icon'          => 'FundProjectionScreenOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'Lock settings',
                'icon'          => 'UnlockOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'Layout',
                'icon'          => 'LayoutOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],

            [
                'name'      => 'Guest policy',
                'icon'          => 'CoffeeOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'Learning anaytics dashboard',
                'icon'          => 'FundViewOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'User experience',
                'icon'          => 'SmileOutlined',
                'created_on'    => date('Y-m-d H:i:s')
            ],
            [
                'name'      => 'ZcaleRight Load Balancer',
                'icon'          => 'ZcaleRight',
                'created_on'    => date('Y-m-d H:i:s')
            ]
        ];
        $categoriesTable->insert($categoriesData)->save();

        /*
        $subCategoriesTable = $this->table('preset_sub_categories');
        $subcategories = [
            [
                'Duration',
                'Maximum participants',
                'Anyone can start the meeting',
                'Join all as moderators',
                'Allow only logged in users'
            ],
            ['Password protected'],
            ['Enabled', 'Auto-start', 'Allow Start/Stop'],
            ['Enabled','Private chat enabled', 'Recording enabled'],

            [
                'Enabled' ,
                'Visible for moderators only',
                'Moderators allowed to eject cameras',
                'Auto-share',
                'Skip preview (always, first join only)'
            ],
            ['Enabled'],
            ['Title','Logo','Banner','Use avatars','Custom CSS'],
            [
                'Users join muted',
                'Moderators allowed to unmute users',
                'Auto-join',
                'Listen-only enabled',
                'Listen-only enforced',
                'Skip echo test (always, first join)'
            ],

            ['Default locale'],
            ['Multi-user pen only','Presenter tools','Multiuser tools'],
            [
                'Disable webcams',
                'Disable microphones',
                'Disable private chat',
                'Disable public chat',
                'Disable shared notes',
                'Disable locked layout',
                'Disable lock on join'
            ],
            ['Presentation','Participants','Chat','Navigation bar','Actions bar'],

            ['Enabled','Policy'],
            ['Enabled','Clean-up delay'],
            ['Keyboard shortcuts enabled','Ask for feedback'],
            ['Pool name']
        ];
        $subCategoriesData = array();
        foreach ($subcategories as $key => $value){
            foreach ($value as $category) {
                $subCategoryData = [
                    'name' => $category,
                    'category_id' => $key+1,
                    'created_on'    => date('Y-m-d H:i:s')
                ];
                array_push($subCategoriesData,$subCategoryData);
            }
        }
        $subCategoriesTable->insert($subCategoriesData)->save();
        */
    }

    public function down(): void
    {
        /*
        $subCategoriesTable = $this->table('preset_sub_categories');
        $subCategoriesTable->getAdapter()->execute("DELETE from preset_sub_categories");
        */

        $categoriesTable = $this->table('preset_categories');
        $categoriesTable->getAdapter()->execute("DELETE from preset_categories");
    }
}

