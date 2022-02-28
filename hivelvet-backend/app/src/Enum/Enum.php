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

namespace Enum;

use ReflectionClass;
use ReflectionException;

class Enum
{
    /**
     * @throws ReflectionException
     */
    public static function values(): array
    {
        $class = new ReflectionClass(static::class);

        return array_values($class->getConstants());
    }

    /**
     * @throws ReflectionException
     */
    public static function constants(): array
    {
        $class = new ReflectionClass(static::class);

        return $class->getConstants();
    }

    /**
     * @throws ReflectionException
     */
    public static function staticProperties(): array
    {
        $class = new ReflectionClass(static::class);

        return $class->getStaticProperties();
    }

    /**
     * @param $value string The class constant name
     *
     * @throws ReflectionException
     */
    public static function contains($value): bool
    {
        return \in_array($value, self::values(), true);
    }
}
