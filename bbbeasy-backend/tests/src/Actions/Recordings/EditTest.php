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

namespace Actions\Recordings;

use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class EditTest extends Scenario
{
    final protected const EDIT_RECORDING_ROUTE = 'PUT /recordings/';
    protected $group                           = 'Actions Recording Edit';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingRecording($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $data  = ['data' => ['name' => '']];
        $f3->mock(self::EDIT_RECORDING_ROUTE . $nonExistingId = $faker->numberBetween(1000), null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Edit non existing recording with id "' . $nonExistingId . '" show an error');

        return $test->results();
    }
}
