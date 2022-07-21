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

class Whiteboard extends Enum
{
    final public const MULTI_USER_PEN   = 'multi_user_pen_only';
    final public const PRESENTER_TOOLS  = 'presenter_tools';
    final public const MULTI_USER_TOOLS = 'multi_user_tools';

    public static string $MULTI_USER_PEN_ONLY_TYPE = 'bool';
    public static string $PRESENTER_TOOLS_TYPE = 'bool';
    public static string $MULTI_USER_TOOLS_TYPE = 'bool';

}
