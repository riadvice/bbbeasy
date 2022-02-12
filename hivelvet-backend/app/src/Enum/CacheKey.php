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

class CacheKey extends Enum
{
    public const CONFIG_LOADED = 'config.loaded';

    public const ORGANISATION = 'organisation';
    public const SITE_LOGO    = 'site.logo_';

    public const API_VERSION = 'api.version_';

    public const AJAX_USERS = 'ajax.users';

    /**
     * Returns cache key for site logo plus size.
     *
     * @param $size
     */
    public static function logoSize($size): string
    {
        return self::SITE_LOGO . $size;
    }
}
