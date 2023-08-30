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

class LockSettings extends Enum
{
    public const GROUP_NAME   = 'Lock Settings';
    public const WEBCAMS      = 'webcams';
    public const MICROPHONES  = 'microphones';
    public const PRIVATE_CHAT = 'private_chat';
    public const PUBLIC_CHAT  = 'public_chat';
    public const SHARED_NOTES = 'shared_notes';
    public const LAYOUT       = 'layout';

    public const WEBCAMS_TYPE      = 'bool';
    public const MICROPHONES_TYPE  = 'bool';
    public const PRIVATE_CHAT_TYPE = 'bool';
    public const PUBLIC_CHAT_TYPE  = 'bool';
    public const SHARED_NOTES_TYPE = 'bool';
    public const LAYOUT_TYPE       = 'bool';
}
