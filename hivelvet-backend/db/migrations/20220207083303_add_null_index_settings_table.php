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

class AddNullIndexSettingsTable extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('settings');

        $table->changeColumn('terms_use', 'string', ['limit' => 256, 'null' => true])
            ->changeColumn('privacy_policy', 'string', ['limit' => 256, 'null' => true])
            ->save();
    }

    public function down(): void
    {
        $this->table('settings')
            ->changeColumn('terms_use', 'string', ['limit' => 256, 'null' => false])
            ->changeColumn('privacy_policy', 'string', ['limit' => 256, 'null' => false])
            ->save();
    }
}
