<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBEasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

namespace Enum\Presets;

use MabeEnum\Enum;

class UserExperience extends Enum
{
    public const GROUP_NAME         = 'User Experience';
    public const KEYBOARD_SHORTCUTS = 'keyboard_shortcuts';
    public const ASK_FOR_FEEDBACK   = 'ask_for_feedback';

    public const KEYBOARD_SHORTCUTS_TYPE = 'bool';
    public const ASK_FOR_FEEDBACK_TYPE   = 'bool';
}
