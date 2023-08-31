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

namespace Core;

use Test\Scenario;
use Utils\PrivilegeUtils;

/**
 * @internal
 *
 * @coversNothing
 */
final class ReflectionTest extends Scenario
{
    protected $group = 'Reflection Based Configuration';

    protected array $permissions = [
        'account'         => ['edit'],
        'labels'          => ['add', 'delete', 'edit', 'index'],
        'logs'            => ['collect'],
        'preset_settings' => ['collect', 'edit'],
        'presets'         => ['add', 'copy', 'delete', 'edit', 'edit_subcategories', 'index'],
        'recordings'      => ['collect', 'delete', 'edit', 'index'],
        'roles'           => ['add', 'collect', 'delete', 'edit', 'index'],
        'rooms'           => ['add', 'delete', 'edit', 'index', 'start', 'view'],
        'settings'        => ['collect', 'edit'],
        'users'           => ['add', 'delete', 'edit', 'index'],
    ];

    /**
     * @return array
     */
    public function testReflectionConfiguration()
    {
        $test = $this->newTest();
        $test->expect($this->permissions === PrivilegeUtils::listSystemPrivileges(), 'Permissions correctly configured in action classes');

        return $test->results();
    }
}
