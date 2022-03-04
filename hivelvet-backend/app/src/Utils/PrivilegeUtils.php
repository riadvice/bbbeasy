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

namespace Utils;

use Base;

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
         * 1 - Filter classes starting with Actions\
         * 2 - Retain classes having only a secondary names space (2 \)
         * 3 - Filter classes having RequirePrivilegeTrait
         * 4 - Actions\Group\PrivilegeName
         * 5 - Later put the list in redis cache when the application starts the first time
         */
        $classMap = $classLoader->getClassMap();
        $actions  = preg_filter('/^Actions\\\[A-Z a-z]*\\\[A-Z a-z]*/', '$0', array_keys($classMap));

        foreach ($actions as $action) {
            $class = new \ReflectionClass($action);
            if (\in_array($prvilegeTtrait, $class->getTraitNames(), true)) {
                $privilegeInfos = explode('\\', $action);
                array_shift($privilegeInfos);
                $privileges[Base::instance()->snakecase($privilegeInfos[0])][] = Base::instance()->snakecase($privilegeInfos[1]);
            }
        }

        return $privileges;
    }
}
