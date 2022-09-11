<?php

declare(strict_types=1);

/*
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

namespace Utils;

class SecurityUtils
{
    public static string $PASSWORD_PATTERN = '/^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[\d]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/';

    public static function credentialsAreCommon(string $username, string $email, string $password): string | null
    {
        // @fixme: to be cached, reload to cache if update time changed
        foreach (json_decode(\Base::instance()->read('security/dictionary/en-US.json')) as $word) {
            $checkVars = array($username, $email, $word);
            if (in_array($password, $checkVars)) {
                return 'Avoid choosing a common password';
            }
        }
        return null;
    }

    public static function isGdprCompliant(string $password): string | null
    {
        return preg_match(self::$PASSWORD_PATTERN, $password) ? 'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character' : null;
    }
}
