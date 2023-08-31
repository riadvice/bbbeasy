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

namespace Fake;

use Faker\Factory as Faker;
use Models\Label;

class LabelFaker
{
    private static array $storage = [];

    public static function create($storageName = null)
    {
        $faker              = Faker::create();
        $label              = new Label();
        $label->name        = $faker->text(14);
        $label->color       = $faker->safeHexColor;
        $label->description = $faker->text;
        $nameLabel          = $label->name;
        $ColorLabel         = $label->color;

        $label->save();

        if (null !== $storageName) {
            self::$storage[$storageName] = $label;
        }

        return $label->getLabelByNameAndColor($nameLabel, $ColorLabel);
    }

    /**
     * @param mixed $storageName
     *
     * @return Label
     */
    public static function get($storageName)
    {
        return self::$storage[$storageName];
    }

    /**
     * @param mixed $data
     *
     * @return array[]
     */
    public static function generateJsondata($data = []): array
    {
        $faker = Faker::create();

        $primaryData = [
            'data' => [
                'name'        => $faker->unique()->name,
                'description' => $faker->sentence,
                'color'       => $faker->safeHexColor,
            ],
        ];

        return ['data' => array_merge($primaryData['data'], $data)];
    }
}
