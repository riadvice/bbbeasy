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

/**
 * Translates the permissions a role holds into the routes they open. A permission is
 * a group and an action, a route alias is the two joined by an underscore.
 */
class RoutePrivileges
{
    /**
     * Request method of an action, anything not listed is read only.
     */
    private const METHODS = [
        'add'                     => 'POST',
        'start'                   => 'POST',
        'reset_password_attempts' => 'POST',
        'collect'                 => 'GET|POST',
        'edit'                    => 'PUT',
        'edit_subcategories'      => 'PUT',
        'publish'                 => 'PUT',
        'delete'                  => 'DELETE',
    ];

    /**
     * Permissions served by more than one route. The room presentations are a
     * namespace of their own, with an index, an add and a delete.
     */
    private const ROUTES = [
        'rooms.presentations' => [
            'GET @rooms_presentations_index',
            'POST @rooms_presentations_add',
            'DELETE @rooms_presentations_delete',
        ],
    ];

    /**
     * Every route the given permissions open, ready to hand to the access control.
     */
    public static function routesFor(array $permissions): array
    {
        $routes = [];

        foreach ($permissions as $group => $actions) {
            foreach ((array) $actions as $action) {
                foreach (self::routes((string) $group, (string) $action) as $route) {
                    $routes[] = $route;
                }
            }
        }

        return array_values(array_unique($routes));
    }

    /**
     * Routes of one permission.
     */
    public static function routes(string $group, string $action): array
    {
        return self::ROUTES[$group . '.' . $action]
            ?? [self::method($action) . ' @' . $group . '_' . $action];
    }

    private static function method(string $action): string
    {
        return self::METHODS[$action] ?? 'GET';
    }
}
