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

namespace Fake;

use Enum\ResetTokenStatus;
use Models\ResetPasswordToken;
use models\User;

class ResetPasswordTokenFaker
{
    private static array $storage = [];

    /**
     * @param null|mixed $storageName
     *
     * @throws \Exception
     */
    public static function create(User $user, string $status = ResetTokenStatus::NEW, $storageName = null): ResetPasswordToken
    {
        // To make testing easier, the user is password is the same as its role
        $token          = new ResetPasswordToken();
        $token->status  = $status;
        $token->user_id = $user->id;
        $id             = $token->user_id;
        $token->save();
        $token->userExists($id);
        if (null !== $storageName) {
            self::$storage[$storageName] = $user;
        }

        // return self::getToken($user, $status, $mytoken)->save();
        return $token;
    }

    /**
     * @param mixed $user
     * @param mixed $status
     * @param mixed $mytoken
     *
     * @throws \Exception
     */
    public static function getToken($user, $status, $mytoken)
    {
        $token          = new ResetPasswordToken();
        $token->status  = $status;
        $token->user_id = $user->id;
        $token->token   = $mytoken;

        return $token;
    }

    /**
     * @param mixed $storageName
     *
     * @return User
     */
    public static function get($storageName)
    {
        return self::$storage[$storageName];
    }
}
