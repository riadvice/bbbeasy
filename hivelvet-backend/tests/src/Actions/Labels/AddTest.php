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
use Models\Label;
use ReflectionException;
use Test\Scenario;

/**
 * Class AddTest.
 *
 * @internal
 * @coversNothing
 */
final class AddTest extends Scenario
{
    final protected const ADD_LABEL_ROUTE = 'POST /labels';
    protected $group                      = 'Action Label Add';

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testValidInput($f3)
    {
        $label = new Label();

        $test = $this->newTest();

        $data = [
            'data' => [
                'name'        => 'label',
                'description' => 'description',
                'color'       => '#ffffff',
            ],
        ];
        $f3->mock(self::ADD_LABEL_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('label/success.json'), 'Add label successuly');

        $test->expect($label->load(['name = ?', 'label']), 'Label Added to DB:' . $label->name);

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testInvalidColor($f3)
    {
        $test = $this->newTest();

        $data = [
            'data' => [
                'name'        => 'label',
                'description' => 'description',
                'color'       => '#ffffXX',
            ],
        ];
        $f3->mock(self::ADD_LABEL_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('label/invalid_color_error.json'), 'Invalid Color');

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testEmptyName($f3)
    {
        $test = $this->newTest();

        $data = [
            'data' => [
                'name'        => '',
                'description' => 'description',
                'color'       => '#ffffff',
            ],
        ];
        $f3->mock(self::ADD_LABEL_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('label/empty_name_error.json'), 'Empty name');

        return $test->results();
    }

    /**
     * @param $f3
     *
     * @throws ReflectionException
     *
     * @return array
     */
    public function testExistingName($f3)
    {
        $test  = $this->newTest();
        $label = LabelFaker::create();
        $data  = [
            'data' => [
                'name'        => $label->name,
                'description' => 'description',
                'color'       => '#ffffff',
            ],
        ];
        $f3->mock(self::ADD_LABEL_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('label/exist_error.json'), 'Add label with an existing name "' . $label->name . '" show an error');

        return $test->results();
    }
}
