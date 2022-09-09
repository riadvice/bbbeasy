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

    public static function credentialsAreCommon(string $username, string $email, string $password, string $error_message, int|null $response_code): bool
    {
        // @fixme: to be cached, reload to cache if update time changed
        foreach (json_decode(\Base::instance()->read('security/dictionary/en-US.json')) as $word) {
            if (\count(array_unique([$password, $username, $email, $word])) < 4) {
                // @todo : move to controller =>  $this->logger->error($error_message, ['error' => $error]);
                return true;
            }
        }

        return false;
    }

    public static function isGdprCompliant(string $password): bool
    {
        return 1 === preg_match(self::$PASSWORD_PATTERN, $password);
    }
}
