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

namespace Models;

use Fake\LabelFaker;
use Fake\PresetFaker;
use Fake\RoomFaker;
use Fake\RoomLabelFaker;
use Fake\UserFaker;
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class RoomLabelTest extends Scenario
{
    protected $group = 'RoomLabel Model';

    /**
     * @param mixed $f3
     *
     * @return array
     */
    public function testRoomLabelCreation($f3)
    {
        $test                = $this->newTest();
        $faker               = Faker::create();
        $user                = UserFaker::create();
        $preset              = PresetFaker::create($user);
        $room                = RoomFaker::create($user, $preset);
        $label               = LabelFaker::create();
        $roomlabel           = new RoomLabel(\Registry::get('db'));
        $roomlabel->room_id  = $room->id;
        $roomlabel->label_id = $label->id;

        $roomlabel->save();

        $test->expect(0 !== $roomlabel->id, 'RoomLabel mocked & saved to the database');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testCollectAllByRoomId($f3)
    {
        $test = $this->newTest();

        $user      = UserFaker::create();
        $preset    = PresetFaker::create($user);
        $roomlabel = new RoomLabel(\Registry::get('db'));
        $roomlabel->erase(['']); // Cleaning the table for test.
        $room       = RoomFaker::create($user, $preset);
        $label      = LabelFaker::create();
        $roomlabel1 = RoomLabelFaker::create($room, $label);
        $roomlabel2 = RoomLabelFaker::create($room, $label);

        $data1 = ['id' => $roomlabel1->id];
        $data2 = ['id' => $roomlabel2->id];
        $data  = [$data1, $data2];

        $test->expect(empty(array_udiff($data, $roomlabel->collectAllByRoomId($room->id), fn ($obj1, $obj2) => $obj1 === $obj2)), 'CollectAllByRoomId(' . $room->id . ') returned all roomlabels for the given room');

        return $test->results();
    }
}
