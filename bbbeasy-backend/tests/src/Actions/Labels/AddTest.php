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
use Models\Label;
use Test\Scenario;

/**
 * Class AddTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class AddTest extends Scenario
{
    final protected const ADD_LABEL_ROUTE = 'POST /labels';
    protected $group                      = 'Action Label Add';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidInput($f3)
    {
        $label = new Label();

        $test = $this->newTest();
        $data = LabelFaker::generateJsondata();

        $f3->mock(self::ADD_LABEL_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('label/success.json'), 'Add label successfully');

        $test->expect($label->load(['name = ?', $f3->snakeCase($data['data']['name'])]), 'Label Added to DB:' . $label->name);

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testInvalidColor($f3)
    {
        $test = $this->newTest();
        $data = LabelFaker::generateJsondata(['color' => '#ffffXX']);

        $f3->mock(self::ADD_LABEL_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('label/invalid_color_error.json'), 'Invalid Color');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testEmptyName($f3)
    {
        $test = $this->newTest();
        $data = LabelFaker::generateJsondata(['name' => '']);

        $f3->mock(self::ADD_LABEL_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('label/empty_name_error.json'), 'Empty name');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testExistingNameOrColor($f3)
    {
        $test  = $this->newTest();
        $label = LabelFaker::create();

        $data1 = LabelFaker::generateJsondata(['name' => $label->name]);
        $f3->mock(self::ADD_LABEL_ROUTE, null, null, $this->postJsonData($data1));
        $test->expect($this->compareTemplateToResponse('label/exist_error.json'), 'Add label with an existing name "' . $label->name . '" show an error');

        $data2 = LabelFaker::generateJsondata(['color' => $label->color]);
        $f3->mock(self::ADD_LABEL_ROUTE, null, null, $this->postJsonData($data2));
        $test->expect($this->compareTemplateToResponse('label/exist_error.json'), 'Add label with an existing color "' . $label->color . '" show an error');

        $data3 = LabelFaker::generateJsondata(['name' => $label->name, 'color' => $label->color]);
        $f3->mock(self::ADD_LABEL_ROUTE, null, null, $this->postJsonData($data3));
        $test->expect($this->compareTemplateToResponse('label/exist_error.json'), 'Add label with an existing name "' . $label->name . '" and an existing color "' . $label->color . '" show an error');

        return $test->results();
    }
}
