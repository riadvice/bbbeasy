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

class Security extends Enum
{
    public const GROUP_NAME             = 'Security';
    public const PASSWORD_FOR_MODERATOR = 'password_for_moderator';
    public const PASSWORD_FOR_ATTENDEE  = 'password_for_attendee';

    public const PASS_FOR_MODERATOR_TYPE = 'bool';
    public const PASS_FOR_ATTENDEE_TYPE  = 'bool';
}
