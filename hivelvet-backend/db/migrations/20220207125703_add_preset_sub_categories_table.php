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

use Phinx\Migration\AbstractMigration;

class AddPresetSubCategoriesTable extends AbstractMigration
{
    public function up(): void
    {
        $first_key = $this->fetchRow('SELECT id FROM preset_categories ORDER BY id LIMIT 1');
        $first_key = $first_key[0];

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
            ['Customizable', 'Auto-start', 'Allow Start/Stop'],
            ['Customizable','Private chat', 'Recording'],

            [
                'Customizable' ,
                'Visible for moderators only',
                'Moderators allowed to eject cameras',
                'Auto-share',
                'Skip preview (always, first join only)'
            ],
            ['Customizable'],
            ['Title','Logo','Banner','Use avatars','Custom CSS'],
            [
                'Users join muted',
                'Moderators allowed to unmute users',
                'Auto-join',
                'Listen-only',
                'Listen-only enforced',
                'Skip echo test (always, first join)'
            ],

            ['Default language'],
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

            ['Customizable','Policy'],
            ['Customizable','Clean-up delay'],
            ['Keyboard shortcuts','Ask for feedback'],
            ['Pool name']
        ];
        $subCategoriesData = array();
        foreach ($subcategories as $value){
            foreach ($value as $subcategory) {
                $subCategoryData = [
                    'name'          => $subcategory,
                    'category_id'   => $first_key,
                    'created_on'    => date('Y-m-d H:i:s')
                ];
                array_push($subCategoriesData,$subCategoryData);
            }
            $first_key++;
        }
        $subCategoriesTable->insert($subCategoriesData)->save();
    }

    public function down(): void
    {
        $subCategoriesTable = $this->table('preset_sub_categories');
        $subCategoriesTable->getAdapter()->execute("DELETE from preset_sub_categories");
    }
}

