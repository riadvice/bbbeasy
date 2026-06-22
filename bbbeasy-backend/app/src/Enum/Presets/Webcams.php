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

class Webcams extends Enum
{
    public const GROUP_NAME                     = 'Webcams';
    public const CONFIGURABLE                   = 'availability';
    public const VISIBLE_FOR_MODERATOR_ONLY     = 'visible_for_moderator_only';
    public const MODERATOR_ALLOWED_CAMERA_EJECT = 'moderator_allowed_camera_eject';
    public const AUTO_SHARE                     = 'auto_share';
    public const SKIP_PREVIEW                   = 'skip_preview';

    public const VISIBLE_FOR_MODERATOR_ONLY_TYPE     = 'bool';
    public const CONFIGURABLE_TYPE                   = 'bool';
    public const MODERATOR_ALLOWED_CAMERA_EJECT_TYPE = 'bool';
    public const AUTO_SHARE_TYPE                     = 'bool';
    public const SKIP_PREVIEW_TYPE                   = 'bool';
}
