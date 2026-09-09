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

namespace Utils;

use Models\User;

class SecurityUtils
{
    /**
     * The passwords credential stuffing tries first. They are all rejected by the
     * strength rules as well, this check only exists to tell the user why.
     */
    private const COMMON_PASSWORDS = [
        '123456', '123456789', '12345678', '1234567890', '1234567', '12345',
        'password', 'password1', 'password123', 'passw0rd', 'p@ssword', 'p@ssw0rd',
        'qwerty', 'qwerty123', 'azerty', 'abc123', 'iloveyou', 'admin', 'welcome',
        'monkey', 'dragon', 'letmein', 'football', 'baseball', 'sunshine',
        'princess', 'superman', 'trustno1', 'starwars', 'whatever', 'zaq12wsx',
        'qazwsx', 'asdfghjkl', '1q2w3e4r', '1qaz2wsx', 'michael', 'jordan23',
        'bigbluebutton', 'bbbeasy',
    ];
    public static string $GDPR_PATTERN = '/^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[\d]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/';

    public static function credentialsAreCommon(string $username, string $email, string $password): ?string
    {
        $message = 'Avoid choosing a common password';

        if (\in_array(mb_strtolower($password), self::COMMON_PASSWORDS, true)) {
            return $message;
        }

        $user = new User();

        $users = $user->getUsers($username, $email);

        foreach ($users as $user1) {
            $user = $user->getByEmail($user1['email']);
            if ($user->verifyPassword($password)) {
                return $message;
            }
        }

        return null;
    }

    public static function isGdprCompliant(string $password): bool|string
    {
        return !preg_match(self::$GDPR_PATTERN, $password) ? 'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character' : true;
    }
}
