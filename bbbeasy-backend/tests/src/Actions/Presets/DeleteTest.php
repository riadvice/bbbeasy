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
use Models\Preset;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class DeleteTest extends Scenario
{
    final protected const DELETE_PRESET_ROUTE = 'DELETE /presets/';
    protected $group                          = 'Action Preset Delete';

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

        $f3->mock(self::DELETE_PRESET_ROUTE . 404);
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Delete non existing preset with id "404" show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testDefaultPreset($f3)
    {
        $test          = $this->newTest();
        $defaultPreset = new Preset();
        $defaultPreset->load(['name = ?', ['default']]);

        $f3->mock(self::DELETE_PRESET_ROUTE . $defaultPreset->id);
        $test->expect($this->compareTemplateToResponse('preset/default_error.json'), 'Delete default preset with id "' . $defaultPreset->id . '" show an error');

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
        $f3->mock(self::DELETE_PRESET_ROUTE . $preset->id);
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Delete existing preset with id "' . $preset->id . '" successfully');

        return $test->results();
    }
}
