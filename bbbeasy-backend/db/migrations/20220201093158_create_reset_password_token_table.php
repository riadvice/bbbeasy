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

final class CreateResetPasswordTokenTable extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('reset_password_tokens');
        $table
            ->addColumn('user_id', 'integer', ['null' => false])
            ->addColumn('token', 'string', ['null' => false])
            ->addColumn('status', 'string', ['null' => false])
            ->addColumn('created_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addColumn('expires_at', 'datetime', ['null' => false, 'timezone' => true])
            ->addForeignKey(['user_id'], 'users', ['id'], ['constraint' => 'users_id'])
            ->addIndex('token', ['unique' => true, 'name' => 'idx_reset_tokens'])

            ->create()
        ;
    }

    public function down(): void
    {
        $this->table('reset_password_tokens')->drop()->save();
    }
}
