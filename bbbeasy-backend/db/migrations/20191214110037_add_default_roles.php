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

use Enum\UserRole;
use Phinx\Migration\AbstractMigration;

final class AddDefaultRoles extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('roles');
        $data  = [
            [
                'name'       => UserRole::ADMINISTRATOR,
                'created_on' => date('Y-m-d H:i:s'),
            ],
            [
                'name'       => UserRole::LECTURER,
                'created_on' => date('Y-m-d H:i:s'),
            ],
        ];

        $table->insert($data)->save();
    }

    public function down(): void
    {
        $table = $this->table('roles');
        $table->getAdapter()->execute("DELETE from roles where name='" . \Enum\UserRole::ADMINISTRATOR . "' or name='" . \Enum\UserRole::LECTURER . "'");
    }
}
