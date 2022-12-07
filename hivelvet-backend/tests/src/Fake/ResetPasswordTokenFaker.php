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

namespace Fake;

use Enum\ResetTokenStatus;
use Models\ResetPasswordToken;
use models\User;

class ResetPasswordTokenFaker
{
    private static array $storage = [];

    public static function create(User $user, string $status = ResetTokenStatus::NEW, $storageName = null)
    {
        // To make testing easier, the user is password is the same as its role
        $token          = new ResetPasswordToken();
        $token->status  = $status;
        $token->user_id = $user->id;

        $token->save();
        if (null !== $storageName) {
            self::$storage[$storageName] = $user;
        }

        return $token;
    }

    /**
     * @param $storageName
     *
     * @return User
     */
    public static function get($storageName)
    {
        return self::$storage[$storageName];
    }
}
