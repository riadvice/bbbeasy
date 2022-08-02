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

namespace Actions\Labels;

use Fake\LabelFaker;
use ReflectionException;
use Test\Scenario;

/**
 * @internal
 * @coversNothing
 */
final class DeleteTest extends Scenario
{
    final public const NON_EXISTING_ID       = '0123456789';
    final protected const DELETE_LABEL_ROUTE = 'DELETE /labels/';
    protected $group                         = 'Actions Label Delete';

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testValidLabel($f3)
    {
        $test  = $this->newTest();
        $label = LabelFaker::create();
        $f3->mock(self::DELETE_LABEL_ROUTE . $label->id);
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Delete existing label with id "' . $label->id . '" successfully');

        $test->expect(!($label->load(['id = ?', $label->id])), 'Label with id "' . $label->id . '"  deleted from DB');

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testNonExistingLabel($f3)
    {
        $test = $this->newTest();

        $f3->mock(self::DELETE_LABEL_ROUTE . self::NON_EXISTING_ID);
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Delete non existing label with id "' . self::NON_EXISTING_ID . '" show an error');

        return $test->results();
    }
}
