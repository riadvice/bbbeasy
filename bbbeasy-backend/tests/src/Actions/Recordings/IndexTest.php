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

namespace Actions\Recordings;

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
final class IndexTest extends Scenario
{
    final protected const INDEX_RECORDING_ROUTE = 'GET /recordings/';
    protected $group                            = 'Action Recording Index';

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

        $faker = Faker::create();
        $f3->mock(self::INDEX_RECORDING_ROUTE . $nonExistingId = $faker->numberBetween(1000), null, null);
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Get all recordings for non existing room with id "' . $nonExistingId . '" show an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testGetRoomRecordings($f3)
    {
        $test = $this->newTest();

        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);
        $f3->mock(self::INDEX_RECORDING_ROUTE . $room->id);

        json_decode($f3->get('RESPONSE'));
        $test->expect(JSON_ERROR_NONE === json_last_error(), 'Get all room recordings');

        return $test->results();
    }
}
