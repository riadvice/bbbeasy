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

class Audio extends Enum
{
    public const GROUP_NAME = 'Audio';

    public const USERS_JOIN_MUTED                   = 'users_join_muted';
    public const MODERATORS_ALLOWED_TO_UNMUTE_USERS = 'moderators_allowed_to_unmute_users';
    public const AUTO_JOIN                          = 'auto_join';
    public const LISTEN_ONLY_ENABLED                = 'listen_only_enabled';
    public const SKIP_ECHO_TEST                     = 'skip_echo_test';

    public const USERS_JOIN_MUTED_TYPE                   = 'bool';
    public const MODERATORS_ALLOWED_TO_UNMUTE_USERS_TYPE = 'bool';
    public const AUTO_JOIN_TYPE                          = 'bool';
    public const LISTEN_ONLY_ENABLED_TYPE                = 'bool';
    public const SKIP_ECHO_TEST_TYPE                     = 'bool';
}
