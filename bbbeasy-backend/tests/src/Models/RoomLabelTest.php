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

use Fake\LabelFaker;
use Fake\PresetFaker;
use Fake\RoomFaker;
use Fake\RoomLabelFaker;
use Fake\UserFaker;
use Test\Scenario;

/**
 * Class RoomLabelTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class RoomLabelTest extends Scenario
{
    protected $group = 'RoomLabel Model';

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testRoomLabelCreation()
    {
        $test                = $this->newTest();
        $user                = UserFaker::create();
        $preset              = PresetFaker::create($user);
        $room                = RoomFaker::create($user, $preset);
        $label               = LabelFaker::create();
        $roomLabel           = new RoomLabel();
        $roomLabel->room_id  = $room->id;
        $roomLabel->label_id = $label->id;

        $roomLabel->save();

        $test->expect(0 !== $roomLabel->id, 'RoomLabel mocked & saved to the database');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetByRoomAndLabel()
    {
        $test      = $this->newTest();
        $user      = UserFaker::create();
        $room      = RoomFaker::create($user, PresetFaker::create($user));
        $label     = LabelFaker::create();
        $roomLabel = RoomLabelFaker::create($room, $label);

        $test->expect($roomLabel->getByRoomAndLabel($room->id, $label->id)->id === $roomLabel->id, 'getByRoomAndLabel(' . $room->id . ',' . $label->id . ') found room label');
        $test->expect(!$roomLabel->getByRoomAndLabel(404, 404)->id, 'getByRoomAndLabel(404, 404) did not find room label');

        $test->expect($roomLabel->roomAndLabelExists($room->id, $label->id), 'roomAndLabelExists(' . $room->id . ',' . $label->id . ') exists');
        $test->expect($roomLabel->roomAndLabelExists($room->id, $label->id, $room->id), 'roomAndLabelExists(' . $room->id . ',' . $label->id . ',' . $room->id . ') exists');
        $test->expect(!$roomLabel->roomAndLabelExists(404, 404), 'roomAndLabelExists(404, 404) does not exist');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testCollectAllByRoomId()
    {
        $test = $this->newTest();

        $user      = UserFaker::create();
        $preset    = PresetFaker::create($user);
        $roomlabel = new RoomLabel();
        $roomlabel->erase(['']); // Cleaning the table for test.
        $room       = RoomFaker::create($user, $preset);
        $label      = LabelFaker::create();
        $roomlabel1 = RoomLabelFaker::create($room, $label);
        $roomlabel2 = RoomLabelFaker::create($room, $label);

        $data1 = ['id' => $roomlabel1->id];
        $data2 = ['id' => $roomlabel2->id];
        $data  = [$data1, $data2];

        $test->expect(empty(array_udiff($data, $roomlabel->collectAllByRoomId($room->id), static fn ($obj1, $obj2) => $obj1 === $obj2)), 'CollectAllByRoomId(' . $room->id . ') returned all roomlabels for the given room');

        return $test->results();
    }
}
