<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

/**
 * The administrator role is filled with the privileges that existed when the instance
 * was installed, so unlocking an account is out of reach on an upgraded instance until
 * the new privilege is granted.
 */
final class GrantResetPasswordAttempts extends AbstractMigration
{
    private const ADMINISTRATOR_ROLE_ID = 1;

    private const GROUP = 'users';

    private const PRIVILEGE = 'reset_password_attempts';

    public function up(): void
    {
        $granted = $this->fetchRow(
            sprintf(
                "SELECT count(*) AS total FROM roles_permissions WHERE role_id = %d AND \"group\" = '%s' AND name = '%s'",
                self::ADMINISTRATOR_ROLE_ID,
                self::GROUP,
                self::PRIVILEGE
            )
        );

        if ((int) $granted['total'] > 0) {
            return;
        }

        $this->table('roles_permissions')
            ->insert([
                'group'      => self::GROUP,
                'name'       => self::PRIVILEGE,
                'role_id'    => self::ADMINISTRATOR_ROLE_ID,
                'created_on' => date('Y-m-d H:i:s'),
                'updated_on' => date('Y-m-d H:i:s'),
            ])
            ->saveData()
        ;
    }

    public function down(): void
    {
        $this->execute(
            sprintf(
                "DELETE FROM roles_permissions WHERE role_id = %d AND \"group\" = '%s' AND name = '%s'",
                self::ADMINISTRATOR_ROLE_ID,
                self::GROUP,
                self::PRIVILEGE
            )
        );
    }
}
