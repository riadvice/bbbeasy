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

namespace Actions\Presets;

use Fake\PresetFaker;
use Fake\UserFaker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class CopyTest extends Scenario
{
    final protected const COPY_PRESET_ROUTE = 'GET /presets/copy/';
    protected $group                        = 'Action Preset Copy';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingPreset($f3)
    {
        $test = $this->newTest();

        $f3->mock(self::COPY_PRESET_ROUTE . 404, null, null);
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Copy non existing preset with id "404" show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidPreset($f3)
    {
        $test = $this->newTest();

        $preset = PresetFaker::create(UserFaker::create());
        $f3->mock(self::COPY_PRESET_ROUTE . $preset->id, null, null);
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Copy existing preset with id "' . $preset->id . '" pass successfully');

        return $test->results();
    }
}
