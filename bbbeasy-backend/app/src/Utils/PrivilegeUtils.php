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
     * Action classes of the application, read from the directory they live in.
     *
     * The composer class map was the obvious source, but an action added after the
     * autoloader was dumped is missing from it, and its privilege then silently
     * disappears from the role matrix.
     */
    private static function actionClasses(): array
    {
        $root = \dirname(__DIR__) . \DIRECTORY_SEPARATOR . 'Actions';

        if (!is_dir($root)) {
            return [];
        }

        $classes  = [];
        $files    = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS));
        $rootSize = mb_strlen($root) + 1;

        foreach ($files as $file) {
            if (!$file->isFile() || 'php' !== $file->getExtension()) {
                continue;
            }

            $relative = mb_substr($file->getPathname(), $rootSize, -4);

            // Only actions living in a namespace of their own, the classes sitting
            // directly under Actions are the shared base ones.
            if (!str_contains($relative, \DIRECTORY_SEPARATOR)) {
                continue;
            }

            $classes[] = 'Actions\\' . str_replace(\DIRECTORY_SEPARATOR, '\\', $relative);
        }

        sort($classes);

        return $classes;
    }
}
