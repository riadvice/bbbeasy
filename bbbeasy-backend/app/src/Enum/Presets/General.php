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

namespace Enum\Presets;

use MabeEnum\Enum;

class General extends Enum
{
    public const GROUP_NAME                 = 'General';
    public const DURATION                   = 'duration';
    public const MAXIMUM_PARTICIPANTS       = 'maximum_participants';
    public const ANYONE_CAN_START           = 'anyone_can_start';
    public const OPEN_FOR_EVERYONE          = 'open_for_everyone';
    public const ALL_JOIN_AS_MODERATOR      = 'all_join_as_moderator';
    public const LOGGED_IN_USERS_ONLY       = 'logged_in_users_only';
    public const WELCOME                    = 'welcome';
    public const DURATION_TYPE              = 'integer';
    public const MAXIMUM_PARTICIPANTS_TYPE  = 'integer';
    public const ANYONE_CAN_START_TYPE      = 'bool';
    public const OPEN_FOR_EVERYONE_TYPE     = 'bool';
    public const ALL_JOIN_AS_MODERATOR_TYPE = 'bool';
    public const LOGGED_IN_USERS_ONLY_TYPE  = 'bool';
    public const WELCOME_TYPE               = 'string';
}
