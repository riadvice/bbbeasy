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

use Fake\RoleFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class AddTest extends Scenario
{
    final protected const ADD_ROLE_ROUTE = 'POST /roles';
    protected $group                     = 'Action Role Add';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testInvalidName($f3)
    {
        $test = $this->newTest();

        $data = ['data' => ['name' => '']];
        $f3->mock(self::ADD_ROLE_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/empty_error.json'), 'Add role with an empty name show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testExistingName($f3)
    {
        $test = $this->newTest();

        $role = RoleFaker::create();
        $data = ['data' => ['name' => $role->name]];
        $f3->mock(self::ADD_ROLE_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('role/exist_error.json'), 'Add role with an existing name "' . $role->name . '" show an error');

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

        $faker = Faker::create();
        $data  = ['data' => ['name' => $faker->name]];
        $f3->mock(self::ADD_ROLE_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Add role with valid name pass');

        return $test->results();
    }
}
