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

namespace Actions\Settings;

use Faker\Factory as Faker;
use Test\Scenario;

/**
 * Class SaveLogoTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class SaveLogoTest extends Scenario
{
    final protected const SAVE_LOGO_ROUTE = 'POST /save-logo';
    protected $group                      = 'Action Logo Save';

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testEmptyData($f3)
    {
        $test = $this->newTest();

        $data = ['logo_name' => ''];
        $f3->mock(self::SAVE_LOGO_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('setting/empty_error.json'), 'Update logo setting with an empty data shown an error');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testInvalidFormat($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $data  = ['logo_name' => $faker->name];
        $f3->mock(self::SAVE_LOGO_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('setting/invalid_format_error.json'), 'Update logo setting with an invalid file format shown an error');

        return $test->results();
    }
}
