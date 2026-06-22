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
final class CollectTest extends Scenario
{
    final protected const COLLECT_ROOMS_ROUTE = 'GET /rooms/';
    protected $group                          = 'Action Room Collect Rooms';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testCollect($f3)
    {
        $test = $this->newTest();

        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);
        $test->expect(0 !== $room->id, 'Room mocked & saved to the database');

        $f3->mock(self::COLLECT_ROOMS_ROUTE . $user->id);
        json_decode($f3->get('RESPONSE'));
        $test->expect(JSON_ERROR_NONE === json_last_error(), 'Collect rooms of user with id "' . $user->id . '"');

        return $test->results();
    }
}
