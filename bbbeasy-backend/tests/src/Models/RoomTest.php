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
use Faker\Factory as Faker;
use Test\Scenario;

/**
 * Class RoomTest.
 *
 * @internal
 *
 * @coversNothing
 */
final class RoomTest extends Scenario
{
    protected $group = 'Room Model';

    /**
     * @return array
     */
    public function testRoomCreation()
    {
        $test             = $this->newTest();
        $faker            = Faker::create();
        $user             = UserFaker::create();
        $preset           = PresetFaker::create($user);
        $room             = new Room();
        $room->name       = $faker->name;
        $room->short_link = $faker->text(14);
        $room->user_id    = $user->id;
        $room->preset_id  = $preset->id;
        $room->meeting_id = $faker->randomNumber();
        $room->save();

        $test->expect(0 !== $room->id, 'Room mocked & saved to the database');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testNameExists()
    {
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);

        $test->expect($room->nameExists($room->name, $user->id), 'nameExists(' . $room->name . ') exists');
        $test->expect(!$room->nameExists('404', $user->id), 'nameExists("404") does not exist');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testMeetingIdExists()
    {
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);

        $test->expect($room->meetingIdExists($room->meeting_id), 'meetingIdExists(' . $room->meeting_id . ') exists');
        $test->expect(!$room->meetingIdExists('404'), 'meetingIdExists("404") does not exist');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testShortLinkExists()
    {
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);

        $test->expect($room->shortlinkExists($room->short_link), 'shortlinkExists(' . $room->short_link . ') exists');
        $test->expect(!$room->shortlinkExists('404'), 'shortlinkExists("404") does not exist');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetByLink()
    {
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);

        $test->expect($room->getByLink($room->short_link)->short_link === $room->short_link, 'getByLink(' . $room->short_link . ') found room');
        $test->expect(!$room->getByLink(404)->short_link, 'getByLink(404) did not find room');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetById()
    {
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);

        $test->expect($room->getById($room->id)->id === $room->id, 'getById(' . $room->id . ') found room');
        $test->expect(!$room->getById(404)->id, 'getById(404) did not find room');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetRoomInfos()
    {
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);

        $data = [
            'id'         => $room->id,
            'name'       => $room->name,
            'preset_id'  => $preset->id,
            'user_id'    => $user->id,
            'short_link' => $room->short_link,
            'labels'     => $room->getLabels($room->id),
        ];
        $test->expect($data === $room->getRoomInfos($room), 'getRoomInfos() returned room');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testGetRecordings()
    {
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);

        $test->expect(null === $room->getRecordingsByRoomMeetingId($room->meeting_id), 'getRecordingsByRoomMeetingId(' . $room->meeting_id . ') returned room recordings');
        $test->expect(null === $room->getRecordingByRecordId('404'), 'getRecordingByRecordId(404) did not found room recordings');

        $recordings = $room->getRecordingsByRoomMeetingId('meeting-1');
        // $recordings = $room->getRecordingsByRoomMeetingId($room->meeting_id);

        /*var_dump($recordings);

        exit;*/
        if (null !== $recordings && \count($recordings) > 0) {
            $test->expect(null !== $recordings, 'getRecordingsByRoomMeetingId(meeting-1) returned room recordings');

            $recordId       = $recordings[0]['key'];
            $recordingExist = $room->getRecordingByRecordId($recordId);
            $recording      = $room->getRecordingByRecordId($recordId, true);

            $test->expect($recordingExist && empty(array_udiff($recordings[0], $recording, static fn ($obj1, $obj2) => $obj1 === $obj2)), 'getRecordingByRecordId(' . $recordId . ') returned recording for the given recordId');
            $test->expect(null === $room->getRecordingByRecordId('404', true), 'getRecordingByRecordId(404) did not found recording');
        }

        return $test->results();
    }

    /**
     * @return array
     */
    public function testGetLabels()
    {
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);

        $label1 = LabelFaker::create();
        $label2 = LabelFaker::create();

        RoomLabelFaker::create($room, $label1);
        RoomLabelFaker::create($room, $label2);
        $labels = [$label1->getLabelInfos($label1), $label2->getLabelInfos($label2)];

        $test->expect($labels === $room->getLabels($room->id), 'getLabels() returned room labels');

        return $test->results();
    }

    /**
     * @return array
     */
    public function testCollectAll()
    {
        $test      = $this->newTest();
        $room      = new Room();
        $roomLabel = new RoomLabel();
        $roomLabel->erase(['']);
        $room->erase(['']); // Cleaning the table for test.

        $user1   = UserFaker::create();
        $user2   = UserFaker::create();
        $preset1 = PresetFaker::create($user1);
        $preset2 = PresetFaker::create($user2);

        $room1 = RoomFaker::create($user1, $preset1);
        $room2 = RoomFaker::create($user1, $preset1);
        $room3 = RoomFaker::create($user2, $preset2);

        $data = [$room1->getRoomInfos($room1), $room2->getRoomInfos($room2), $room3->getRoomInfos($room3)];
        $test->expect($data === $room->collectAll(), 'collectAll() returned all rooms');

        $data1 = ['id' => $room1->id, 'name' => $room1->name, 'short_link' => $room1->short_link];
        $data2 = ['id' => $room2->id, 'name' => $room2->name, 'short_link' => $room2->short_link];
        $data  = [$data1, $data2];
        $test->expect(empty(array_udiff($data, $room->collectAllByUserId($user1->id), static fn ($obj1, $obj2) => $obj1 === $obj2)), 'CollectAllByUserId(' . $user1->id . ') returned all rooms for the given user');

        $data = ['id' => $room3->id, 'name' => $room3->name, 'short_link' => $room3->short_link];
        $test->expect(empty(array_udiff($data, $room->collectAllByPresetId($preset2->id), static fn ($obj1, $obj2) => $obj1 === $obj2)), 'CollectAllByPresetId(' . $preset2->id . ') returned all rooms for the given preset');

        return $test->results();
    }

    /**
     * @return array
     *
     * @throws \Exception
     */
    public function testDeleteRoom()
    {
        $test   = $this->newTest();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $room   = RoomFaker::create($user, $preset);
        $roomId = $room->id;

        $test->expect(0 !== $roomId, 'Room with id "' . $roomId . '" mocked & saved to the database');

        $room->delete();
        $test->expect(!$room->load(['id = ?', $roomId]), 'Room with id "' . $roomId . '" deleted from DB');

        return $test->results();
    }
}
