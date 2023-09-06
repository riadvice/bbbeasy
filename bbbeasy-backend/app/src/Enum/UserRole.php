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

namespace Enum;

class UserRole extends Enum
{
    final public const VISITOR       = 'visitor';
    final public const LECTURER      = 'lecturer';
    final public const ADMINISTRATOR = 'administrator';
    final public const API           = 'api';

    final public const ADMINISTRATOR_ID = 1;
    final public const LECTURER_ID      = 2;
    final public const NON_EXISTING_ID  = 1000;
}
