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

use Phinx\Migration\AbstractMigration;

class CreateSettingsTables extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('settings');
        $table
            ->addColumn('company_name', 'string', ['limit' => 256, 'null' => false])
            ->addColumn('company_website', 'string', ['limit' => 256, 'null' => false])
            ->addColumn('platform_name', 'string', ['limit' => 256, 'null' => false])
            ->addColumn('terms_use', 'string', ['limit' => 256, 'null' => true])
            ->addColumn('privacy_policy', 'string', ['limit' => 256, 'null' => true])

            ->addColumn('logo', 'string', ['limit' => 256, 'null' => true])
            ->addColumn('brand_color', 'string', ['limit' => 256, 'null' => false])
            ->addColumn('default_font_size', 'integer', ['null' => false])
            ->addColumn('border_radius', 'integer', ['null' => false])
            ->addColumn('wireframe_style', 'boolean', ['null' => false])
            ->addColumn('self_registration', 'boolean', ['null' => false])
            ->addColumn('send_registration', 'boolean', ['null' => false])

            ->addColumn('created_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addColumn('updated_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->save()
        ;
    }

    public function down(): void
    {
        $this->table('settings')->drop()->save();
    }
}
