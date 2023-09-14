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

namespace Utils;

use Models\User;

class SecurityUtils
{
    public static string $GDPR_PATTERN = '/^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[\d]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/';

    public static function credentialsAreCommon(string $username, string $email, string $password): string|null
    {
        $user = new User();

        $users = $user->getUsers($username, $email);

        foreach ($users as $user1) {
            $user = $user->getByEmail($user1['email']);
            if ($user->verifyPassword($password)) {
                return 'Avoid choosing a common password';
            }
        }
        // @fixme: to be cached, reload to cache if update time changed

        return null;
    }

    public static function isGdprCompliant(string $password): string|bool
    {
        return !preg_match(self::$GDPR_PATTERN, $password) ? 'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character' : true;
    }
}
