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

class Branding extends Enum
{
    final public const TITLE        = 'title';
    final public const LOGO         = 'logo';
    final public const BANNER_TEXT  = 'banner_text';
    final public const BANNER_COLOR = 'banner_color';
    final public const USE_AVATARS  = 'use_avatars';
    final public const CUSTOM_CSS   = 'custom_css';


    public static string $TITLE_TYPE ="string";
    public static string $LOGO_TYPE ="file";
    public static string  $BANNER_TEXT_TYPE ="string";
    public static string $BANNER_COLOR_TYPE ="color";
    public static string $USE_AVATARS_TYPE ="bool";
    public static string $CUSTOM_CSS_TYPE ="bool";

}
