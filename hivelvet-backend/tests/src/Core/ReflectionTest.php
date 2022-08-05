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

namespace Core;

use Test\Scenario;
use Utils\PrivilegeUtils;

/**
 * @internal
 * @coversNothing
 */
final class ReflectionTest extends Scenario
{
    protected $group = 'Reflection Based Configuration';

    protected array $permissions = [
        'labels'            => ['add', 'delete', 'edit', 'index'],
        'logs'              => ['collect'],
        'roles_permissions' => ['collect'],
        'roles'             => ['add', 'collect', 'delete', 'edit', 'index'],
        'users'             => ['add', 'delete', 'edit', 'index'],
    ];

    /**
     * @param $f3 \Base
     *
     * @return array
     */
    public function testReflectionConfiguration($f3)
    {
        $test = $this->newTest();
        $test->expect($this->permissions === PrivilegeUtils::listSystemPrivileges(), 'Permissions correctly configured in action classes');

        return $test->results();
    }
}
