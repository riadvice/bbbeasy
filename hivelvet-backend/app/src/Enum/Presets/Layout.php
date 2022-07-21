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

class Layout extends Enum
{
    final public const PRESENTATION   = 'presentation';
    final public const PARTICIPANTS   = 'participants';
    final public const CHAT           = 'chat';
    final public const NAVIGATION_BAR = 'navigation_bar';
    final public const ACTIONS_BAR    = 'actions_bar';


    public static string $PRESENTATION_TYPE = 'bool';
    public static string $PARTICIPANTS_TYPE = 'bool';
    public static string $CHAT_TYPE = 'bool';
    public static string $NAVIGATION_BAR_TYPE = 'bool';
    public static string $ACTIONS_BAR_TYPE = 'bool';

}
