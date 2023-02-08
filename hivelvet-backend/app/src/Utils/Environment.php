<?php

declare(strict_types=1);

/*
 * Hivelvet open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
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

namespace Utils;

class Environment
{
    final public const TEST        = 'test';
    final public const DEVELOPMENT = 'development';
    final public const PRODUCTION  = 'production';

    public static function isProduction(): bool
    {
        return self::PRODUCTION === \Base::instance()->get('application.environment');
    }

    public static function isNotProduction(): bool
    {
        return !self::isProduction();
    }

    public static function isTest(): bool
    {
        return self::TEST === \Base::instance()->get('application.environment');
    }
}
