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

namespace Core;

use Test\Scenario;
use Utils\PrivilegeUtils;
use Utils\RoutePrivileges;

/**
 * @internal
 *
 * @coversNothing
 */
final class RoutePrivilegesTest extends Scenario
{
    protected $group = 'Route Privileges';

    /**
     * Every privilege a role can hold has to name a route that exists, an alias that
     * does not resolve silently grants nothing at all.
     *
     * @param mixed $f3
     */
    public function testEveryPrivilegeNamesAKnownRoute($f3): array
    {
        $test    = $this->newTest();
        $aliases = array_keys($f3->get('ALIASES'));

        foreach (PrivilegeUtils::listSystemPrivileges() as $group => $actions) {
            foreach ($actions as $action) {
                $routes  = RoutePrivileges::routes($group, $action);
                $unknown = [];

                foreach ($routes as $route) {
                    $alias = mb_substr((string) mb_strstr($route, '@'), 1);
                    if (!\in_array($alias, $aliases, true)) {
                        $unknown[] = $alias;
                    }
                }

                $test->expect([] === $unknown, $group . '.' . $action . ' is routed by ' . implode(', ', $routes));
            }
        }

        return $test->results();
    }

    /**
     * The method has to match the one the route is declared with, allowing a GET on a
     * route served over PUT leaves the action closed.
     *
     * @param mixed $f3
     */
    public function testEveryPrivilegeUsesTheRouteMethod($f3): array
    {
        $test = $this->newTest();

        foreach (PrivilegeUtils::listSystemPrivileges() as $group => $actions) {
            foreach ($actions as $action) {
                foreach (RoutePrivileges::routes($group, $action) as $route) {
                    [$method, $alias] = explode(' @', $route);
                    $declared         = $this->routeMethods($f3, $f3->get('ALIASES')[$alias] ?? '');

                    $test->expect(
                        [] !== array_intersect(explode('|', $method), $declared),
                        $group . '.' . $action . ' is allowed over ' . $method . ' and served over ' . implode('|', $declared)
                    );
                }
            }
        }

        return $test->results();
    }

    /**
     * Permissions of a role turn into the union of the routes of each one of them.
     *
     * @param mixed $f3
     */
    public function testRoutesForARole($f3): array
    {
        $test = $this->newTest();

        $routes = RoutePrivileges::routesFor([
            'rooms'  => ['add', 'delete', 'presentations'],
            'labels' => ['index'],
        ]);

        $test->expect(
            [
                'POST @rooms_add',
                'DELETE @rooms_delete',
                'GET @rooms_presentations_index',
                'POST @rooms_presentations_add',
                'DELETE @rooms_presentations_delete',
                'GET @labels_index',
            ] === $routes,
            'routesFor() returned every route of the given permissions'
        );

        $test->expect([] === RoutePrivileges::routesFor([]), 'routesFor() returned nothing for a role without permissions');

        return $test->results();
    }

    /**
     * Methods a route is declared with, taken from the routing table.
     *
     * @param mixed $f3
     */
    private function routeMethods($f3, string $pattern): array
    {
        $methods = [];

        foreach ($f3->get('ROUTES')[$pattern] ?? [] as $handlers) {
            $methods = array_merge($methods, array_keys($handlers));
        }

        return array_values(array_unique($methods));
    }
}
