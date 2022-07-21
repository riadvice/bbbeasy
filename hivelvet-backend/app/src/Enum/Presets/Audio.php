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

namespace Enum\Presets;

use Enum\Enum;

class Audio extends Enum
{
     final public const USERS_JOIN_MUTED                   = 'users_join_muted';
    final public const MODERATORS_ALLOWED_TO_UNMUTE_USERS = 'moderators_allowed_to_unmute_users';
    final public const AUTO_JOIN                          = 'auto_join';
    final public const LISTEN_ONLY                        = 'listen_only_enabled';
    final public const SKIP_ECHO_TEST                     = 'skip_echo_test';


    public static string $USERS_JOIN_MUTED_TYPE           ='bool';
    public static string $MODERATORS_ALLOWED_TO_UNMUTE_USERS_TYPE          ='bool';
    public static string $AUTO_JOIN_TYPE             ='bool';
    public static string $LISTEN_ONLY_ENABLED_TYPE           ='bool';
    public static string $SKIP_ECHO_TEST_TYPE           ='bool';
}
