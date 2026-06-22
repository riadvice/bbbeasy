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

final class CreateRolesPermissionsTable extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('roles_permissions');
        $table
            ->addColumn('role_id', 'integer', ['null' => false])
            ->addColumn('group', 'string', ['limit' => 64, 'null' => false])
            ->addColumn('name', 'string', ['limit' => 64, 'null' => false])
            ->addColumn('created_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addColumn('updated_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addForeignKey(['role_id'], 'roles', ['id'], ['constraint' => 'permission_role_id'])
            ->save()
        ;
    }

    public function down(): void
    {
        $this->table('roles_permissions')->drop()->save();
    }
}
