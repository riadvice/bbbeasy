<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

namespace Utils;

use Sukarix\Utils\PrivilegeUtils as BasePrivilegeUtils;

/**
 * The privileges BBBEasy declares, read from the action classes that carry them.
 */
class PrivilegeUtils
{
    private const ACTIONS_NAMESPACE = 'Actions';

    private const PRIVILEGE_TRAIT = 'Actions\\RequirePrivilegeTrait';

    /**
     * @return array<string, list<string>>
     */
    public static function listSystemPrivileges(): array
    {
        return BasePrivilegeUtils::listSystemPrivileges(
            \dirname(__DIR__) . \DIRECTORY_SEPARATOR . self::ACTIONS_NAMESPACE,
            self::ACTIONS_NAMESPACE,
            self::PRIVILEGE_TRAIT
        );
    }
}
