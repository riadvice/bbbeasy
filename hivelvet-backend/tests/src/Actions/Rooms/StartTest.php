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
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class StartTest extends Scenario
{
    final protected const START_ROOM_ROUTE = 'POST /rooms/';
    protected $group                       = 'Action Room Start';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingRoom($f3)
    {
        $test = $this->newTest();

        $f3->mock(self::START_ROOM_ROUTE . 404, null, null);
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Start meeting for non existing room with id "404" show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidRoom($f3)
    {
        $test = $this->newTest();

        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);

        $f3->mock(self::START_ROOM_ROUTE . $room->id, null, null);

        json_decode($f3->get('RESPONSE'));
        $test->expect(JSON_ERROR_NONE === json_last_error(), 'Start room meeting with id "' . $room->id . '" and meeting_id "' . $room->meeting_id . '"');

        return $test->results();
    }
}
