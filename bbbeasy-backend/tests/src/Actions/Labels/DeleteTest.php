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

namespace Actions\Labels;

use Fake\LabelFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class DeleteTest extends Scenario
{
    final protected const DELETE_LABEL_ROUTE = 'DELETE /labels/';
    protected $group                         = 'Actions Label Delete';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidLabel($f3)
    {
        $test  = $this->newTest();
        $label = LabelFaker::create();
        $f3->mock(self::DELETE_LABEL_ROUTE . $label->id);
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Delete existing label with id "' . $label->id . '" successfully');

        $test->expect(!$label->load(['id = ?', $label->id]), 'Label with id "' . $label->id . '"  deleted from DB');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingLabel($f3)
    {
        $test  = $this->newTest();
        $faker = Faker::create();

        $f3->mock(self::DELETE_LABEL_ROUTE . $nonExistingId = $faker->numberBetween(1000));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Delete non existing label with id "' . $nonExistingId . '" show an error');

        return $test->results();
    }
}
