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

class Branding extends Enum
{
    public const GROUP_NAME = 'Branding';

    public const TITLE        = 'title';
    public const LOGO         = 'logo';
    public const BANNER_TEXT  = 'banner_text';
    public const BANNER_COLOR = 'banner_color';
    public const USE_AVATARS  = 'use_avatars';

    public const TITLE_TYPE        = 'string';
    public const LOGO_TYPE         = 'file';
    public const BANNER_TEXT_TYPE  = 'string';
    public const BANNER_COLOR_TYPE = 'color';
    public const USE_AVATARS_TYPE  = 'bool';
}
