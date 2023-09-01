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

namespace Actions\Roles;

use Enum\UserRole;
use Fake\RoleFaker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class DeleteTest extends Scenario
{
    final protected const DELETE_ROLE_ROUTE = 'DELETE /roles/';
    protected $group                        = 'Action Role Delete';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingRole($f3)
    {
        $test = $this->newTest();

        $f3->mock(self::DELETE_ROLE_ROUTE . UserRole::NON_EXISTING_ID);
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Delete non existing role with id "' . UserRole::NON_EXISTING_ID . '" show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidRole($f3)
    {
        $test = $this->newTest();

        $role = RoleFaker::create();
        $f3->mock(self::DELETE_ROLE_ROUTE . $role->id);
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Delete existing role with id "' . $role->id . '" successfully');

        return $test->results();
    }
}
