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

use Fake\PresetFaker;
use Fake\UserFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * Class PresetTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class PresetTest extends Scenario
{
    protected $group = 'Preset Model';

    /**
     * @return array
     */
    public function testPresetCreation()
    {
        $test            = $this->newTest();
        $faker           = Faker::create();
        $user            = UserFaker::create();
        $preset          = new Preset();
        $preset->name    = $faker->name;
        $preset->user_id = $user->id;
        $result          = $preset->addDefaultSettings('Default preset successfully added', 'Default preset could not be added');

        $test->expect(0 !== $preset->id && $result, 'Preset mocked & saved to the database');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetById()
    {
        $test   = $this->newTest();
        $preset = PresetFaker::create(UserFaker::create());

        $test->expect($preset->findById($preset->id)->id === $preset->id, 'findById(' . $preset->id . ') found preset');
        $test->expect(!$preset->findById(404)->id, 'findById(404) did not find user');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testNameExists()
    {
        $test   = $this->newTest();
        $preset = PresetFaker::create(UserFaker::create());

        $test->expect($preset->nameExists($preset->name, $preset->user_id), 'nameExists(' . $preset->name . ',' . $preset->user_id . ') exists');
        $test->expect(!$preset->nameExists('404', '404'), 'nameExists("404", "404") does not exist');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testNameFormatting()
    {
        $test            = $this->newTest();
        $user            = UserFaker::create();
        $preset          = new Preset();
        $preset->name    = 'presetPreset';
        $preset->user_id = $user->id;
        $result          = $preset->addDefaultSettings('Default preset successfully added', 'Default preset could not be added');

        $test->expect(0 !== $preset->id && $result, 'Preset mocked and saved to the database');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetMyPresetInfos()
    {
        $test     = $this->newTest();
        $preset   = PresetFaker::create(UserFaker::create());
        $myPreset = $preset->toArray(['id', 'name', 'settings']);
        $room     = new Room();

        $data = [
            'id'         => $myPreset['id'],
            'name'       => $myPreset['name'],
            'categories' => $preset->getMyPresetCategories(json_decode($myPreset['settings'])),
            'nb_rooms'   => \count($room->collectAllByPresetId($myPreset['id'])),
        ];

        $test->expect(empty(array_udiff($data, $preset->getMyPresetInfos($myPreset), static fn ($obj1, $obj2) => $obj1 === $obj2)), 'getRoleInfos() returned role informations');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testGetDefaultOneByUserId()
    {
        $test       = $this->newTest();
        $preset     = new Preset();
        $user       = UserFaker::create();
        $userPreset = $user->saveDefaultPreset(true);

        $test->expect($preset->getDefaultOneByUserId($user->id)->id === $userPreset->id, 'getDefaultOneByUserId(' . $user->id . ') found default preset for given user');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testCollectAllByUserId()
    {
        $test   = $this->newTest();
        $preset = new Preset();
        $user   = UserFaker::create();

        $preset->erase(['']); // Cleaning the table for test.

        $preset1 = PresetFaker::create($user);
        $preset2 = PresetFaker::create($user);

        $data1 = ['id' => $preset1->id, 'name' => $preset1->name, 'settings' => $preset1->settings];
        $data2 = ['id' => $preset2->id, 'name' => $preset2->name, 'settings' => $preset2->settings];
        $data  = [$data1, $data2];

        $test->expect(empty(array_udiff($data, $preset->collectAllByUserId($user->id), static fn ($obj1, $obj2) => $obj1 === $obj2)), 'CollectAllByUserId(' . $user->id . ') returned all presets for the given user');

        return $test->results();
    }
}
