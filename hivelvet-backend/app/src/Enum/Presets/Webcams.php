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

class Webcams extends Enum
{
    final public const CONFIGURABLE                   = 'configurable';
    final public const VISIBLE_FOR_MODERATOR_ONLY     = 'visible_for_moderator_only';
    final public const MODERATOR_ALLOWED_CAMERA_EJECT = 'moderator_allowed_camera_eject';
    final public const AUTO_SHARE                     = 'auto_share';
    final public const SKIP_PREVIEW                   = 'skip_preview';

    public static string $VISIBLE_FOR_MODERATOR_ONLY_TYPE = 'bool';
    public static string $CONFIGURABLE_TYPE = 'bool';
    public static string $MODERATOR_ALLOWED_CAMERA_EJECT_TYPE = 'bool';
    public static string $AUTO_SHARE_TYPE = 'bool';
    public static string $SKIP_PREVIEW_TYPE = 'bool';

}
