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

class General extends Enum
{
    final public const DURATION              = 'duration';
    final public const MAXIMUM_PARTICIPANTS  = 'maximum_participants';
    final public const ANYONE_CAN_START      = 'anyone_can_start';
    final public const OPEN_FOR_EVERYONE     = 'open_for_everyone';
    final public const ALL_JOIN_AS_MODERATOR = 'all_join_as_moderator';
    final public const LOGGED_IN_USERS_ONLY  = 'logged_in_users_only';


    public static string $DURATION_TYPE = 'integer';
    public static string $MAXIMUM_PARTICIPANTS_TYPE = 'integer';
    public static string $ANYONE_CAN_START_TYPE = 'bool';
    public static string $OPEN_FOR_EVERYONE_TYPE = 'bool';
    public static string $ALL_JOIN_AS_MODERATOR_TYPE = 'bool';
    public static string $LOGGED_IN_USERS_ONLY_TYPE = 'bool';
}
