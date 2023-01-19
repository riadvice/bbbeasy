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

namespace Actions\Rooms;

use Fake\PresetFaker;
use Fake\RoomFaker;
use Fake\UserFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class EditTest extends Scenario
{
    final protected const EDIT_ROOM_ROUTE = 'PUT /rooms/';
    protected $group                      = 'Actions Rooms Edit';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingRoom($f3)
    {
        $test  = $this->newTest();
        $faker = Faker::create();
        $data  = ['data' => ['name' => '']];

        $f3->mock(self::EDIT_ROOM_ROUTE . $nonExistingId = $faker->numberBetween(1000), null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Edit non existing room with id "' . $nonExistingId . '" show an error');

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
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);
        $data   = ['data' => ['name' => '']];

        $f3->mock(self::EDIT_ROOM_ROUTE . $room->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('room/empty_error.json'), 'Edit existing room with id "' . $room->id . '" using an empty name show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testExistingName($f3)
    {
        $test    = $this->newTest();
        $user    = UserFaker::create();
        $preset  = PresetFaker::create($user);
        $roomOne = RoomFaker::create($user, $preset);
        $roomTwo = RoomFaker::create($user, $preset);
        $data    = ['data' => ['name' => $roomTwo->name]];

        $f3->mock(self::EDIT_ROOM_ROUTE . $roomOne->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('room/exist_error.json'), 'Update existing room with id "' . $roomOne->id . '" using an existing name "' . $roomTwo->name . '" show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     */
    public function testValidRoom($f3)
    {
        $test   = $this->newTest();
        $faker  = Faker::create();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);
        $data   = ['data' => ['name' => $faker->name]];

        $f3->mock(self::EDIT_ROOM_ROUTE . $room->id, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success', 'room' => $room->getRoomInfos()]), 'Update existing room with id "' . $room->id . '" using new name "' . $room->name . '" successfully');

        return $test->results();
    }
}
