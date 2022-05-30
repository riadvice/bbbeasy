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

class LockSettings extends Enum
{
    final public const WEBCAMS      = 'webcams';
    final public const MICROPHONES  = 'microphones';
    final public const PRIVATE_CHAT = 'private_chat';
    final public const PUBLIC_CHAT  = 'public_chat';
    final public const SHARED_NOTES = 'shared_notes';
    final public const LAYOUT       = 'layout';

    public static string $icon = 'UnlockOutlined';
    public static string $WEBCAMS_TYPE = 'bool';
    public static string $MICROPHONES_TYPE = 'bool';
    public static string $PRIVATE_CHAT_TYPE = 'bool';
    public static string $PUBLIC_CHAT_TYPE = 'bool';
    public static string $SHARED_NOTES_TYPE = 'bool';
    public static string $LAYOUT_TYPE = 'bool';

}
