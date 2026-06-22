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

namespace Models;

use Fake\LabelFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * Class LabelTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class LabelTest extends Scenario
{
    protected $group = 'Label Model';

    /**
     * @return array
     */
    public function testLabelCreation()
    {
        $test               = $this->newTest();
        $faker              = Faker::create();
        $label              = new Label();
        $label->name        = $faker->name;
        $label->color       = $faker->safeHexColor();
        $label->description = $faker->text();
        $label->save();

        $test->expect(0 !== $label->id, 'Label mocked and saved to the database');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testDefaultColor()
    {
        $test               = $this->newTest();
        $faker              = Faker::create();
        $label              = new Label();
        $label->name        = $faker->name;
        $label->description = $faker->text();
        $label->save();

        $test->expect(0 !== $label->id, 'Label mocked and saved to the database');
        $test->expect($label->color, 'Color defaulted to ' . $label->color);

        return $test->results();
    }

    /**
     * @return array
     */
    public function testNameFormatting()
    {
        $test               = $this->newTest();
        $faker              = Faker::create();
        $label              = new Label();
        $label->name        = 'labelLabel';
        $label->color       = $faker->safeHexColor();
        $name               = $label->name;
        $color              = $label->color;
        $label->description = $faker->text();
        $label->save();
        $myLabel = $label->getLabelByNameAndColor($name, $color);
        $test->expect(0 !== $myLabel->id, 'Label mocked and saved to the database');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetById()
    {
        $test  = $this->newTest();
        $label = LabelFaker::create();

        $test->expect($label->getById($label->id)->id === $label->id, 'getById(' . $label->id . ') found label');
        $test->expect(!$label->getById(404)->id, 'getById(404) did not find label');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetByColor()
    {
        $test  = $this->newTest();
        $label = LabelFaker::create();

        $arrayColor = ['name' => $label->name, 'value' => $label->color];

        $test->expect($label->getByColor($label->color)->color === $label->color, 'getByColor(' . $label->color . ') found label');
        $test->expect($label->getByColor($arrayColor)->color === $label->color, 'getByColor(' . $arrayColor . ') found label');
        $test->expect(!$label->getByColor('404')->color, 'getByColor(404) did not find label');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetAllLabels()
    {
        $test  = $this->newTest();
        $label = new Label();
        $label->erase(['']); // Cleaning the table for test.
        $label1 = LabelFaker::create();
        $label2 = LabelFaker::create();
        $data   = [$label1->getLabelInfos($label1), $label2->getLabelInfos($label2)];

        $test->expect($data === $label->getAllLabels(), 'getAllLabels() returned all labels');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetLabelInfos()
    {
        $test  = $this->newTest();
        $label = LabelFaker::create();
        $data  = [
            'key'         => $label->id,
            'name'        => $label->name,
            'description' => $label->description,
            'color'       => $label->color,
            'nb_rooms'    => \count($label->getRooms($label->id)),
        ];
        $test->expect($data === $label->getLabelInfos($label), 'getLabelInfos() returned label');

        return $test->results();
    }
}
