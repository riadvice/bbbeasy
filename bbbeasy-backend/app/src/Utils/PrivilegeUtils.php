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

class PrivilegeUtils
{
    private const PRIVILEGE_TRAIT = 'Actions\RequirePrivilegeTrait';

    /**
     * Every privilege the application declares, as a list of actions per group. An
     * action class carries a privilege by using the RequirePrivilegeTrait, its group
     * and its name come from the namespace it lives in.
     */
    public static function listSystemPrivileges(): array
    {
        $f3         = \Base::instance();
        $privileges = [];

        foreach (self::actionClasses() as $action) {
            if (!\in_array(self::PRIVILEGE_TRAIT, new \ReflectionClass($action)->getTraitNames(), true)) {
                continue;
            }

            [, $group, $name] = explode('\\', $action);

            // Several classes can share one privilege, the room presentations live in
            // their own namespace with an index, an add and a delete.
            $privileges[$f3->snakecase($group)][$f3->snakecase($name)] = true;
        }

        foreach ($privileges as $group => $actions) {
            $actions = array_keys($actions);
            sort($actions);
            $privileges[$group] = $actions;
        }

        ksort($privileges);

        return $privileges;
    }

    /**
     * Action classes of the application, taken from the composer class map.
     *
     * @todo put the list in the cache when the application starts the first time
     */
    private static function actionClasses(): array
    {
        $autoloader = '';

        foreach (get_declared_classes() as $className) {
            if (str_starts_with($className, 'ComposerAutoloaderInit')) {
                $autoloader = $className;

                break;
            }
        }

        $classes = array_keys($autoloader::getLoader()->getClassMap());

        // Classes under Actions with at least two namespace levels. A class nested
        // deeper, such as the room presentations, still carries the privilege of the
        // first two levels, its own namespace being the action name.
        return array_values(array_filter(
            $classes,
            static fn (string $class): bool => str_starts_with($class, 'Actions\\') && mb_substr_count($class, '\\') >= 2
        ));
    }
}
