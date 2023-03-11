<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBEasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

use Phinx\Migration\AbstractMigration;

final class CreateLabelsTable extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('labels');
        $table
            ->addColumn('name', 'string', ['limit' => 32, 'null' => false])
            ->addColumn('description', 'text', ['null' => true])
            ->addColumn('color', 'string', ['limit' => 7, 'default' => '#fbbc0b'])
            ->addColumn('created_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addColumn('updated_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addIndex('name', ['unique' => true, 'name' => 'idx_labels_name'])
            ->save()
        ;
    }

    public function down(): void
    {
        $this->table('labels')->drop()->save();
    }
}
