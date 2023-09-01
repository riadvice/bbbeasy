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

namespace Utils;

class PrivilegeUtils
{
    public static function listSystemPrivileges(): array
    {
        $privileges     = [];
        $prvilegeTtrait = 'Actions\RequirePrivilegeTrait';

        $classes             = get_declared_classes();
        $autoloaderClassName = '';
        foreach ($classes as $className) {
            if (str_starts_with($className, 'ComposerAutoloaderInit')) {
                $autoloaderClassName = $className;

                break;
            }
        }
        $classLoader = $autoloaderClassName::getLoader();

        /*
         * @todo:
         * 5 - Later put the list in redis cache when the application starts the first time
         */
        $classMap = $classLoader->getClassMap();
        // Filter classes starting with "Actions\" having only a secondary names space (2 \)
        $actions = preg_filter('/^Actions\\\[A-Z a-z]*\\\[A-Z a-z]*/', '$0', array_keys($classMap));

        foreach ($actions as $action) {
            $class = new \ReflectionClass($action);
            if (\in_array($prvilegeTtrait, $class->getTraitNames(), true)) {
                // Filter classes having RequirePrivilegeTrait
                $privilegeInfos = explode('\\', $action);
                array_shift($privilegeInfos);
                $privileges[\Base::instance()->snakecase($privilegeInfos[0])][] = \Base::instance()->snakecase($privilegeInfos[1]);
            }
        }

        return $privileges;
    }
}
