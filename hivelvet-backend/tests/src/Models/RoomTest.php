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
     * @param mixed $f3
     *
     * @return array
     */
    public function testRoomCreation($f3)
    {
        $test             = $this->newTest();
        $faker            = Faker::create();
        $user             = UserFaker::create();
        $preset           = PresetFaker::create($user);
        $room             = new Room(\Registry::get('db'));
        $room->name       = $faker->name;
        $room->short_link = $faker->url;
        $room->user_id    = $user->id;
        $room->preset_id  = $preset->id;
        $room->meeting_id = $faker->randomNumber();
        $room->save();

        $test->expect(0 !== $room->id, 'Room mocked & saved to the database');

        return $test->results();
    }

        /**
         * @return array
         * */
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
     * */
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
      public function testCollectAll()
      {
          $test = $this->newTest();
          $room = new Room(\Registry::get('db'));
          $room->erase(['']); // Cleaning the table for test.
          $user   = UserFaker::create();
          $preset = PresetFaker::create($user);
          $room1  = RoomFaker::create($user, $preset);
          $room2  = RoomFaker::create($user, $preset);
          $data   = [$room1->getRoomInfos($room1->id), $room2->getRoomInfos($room2->id)];

          $test->expect($data === $room->collectAll(), 'collectAll() returned all rooms');

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
            'key'        => $room->id,
            'name'       => $room->name,
            'short_link' => $room->short_link,
            'preset'     => $preset->name,
        ];
        $test->expect($data === $room->getRoomInfos($room->id), 'getRoomInfos() returned room');

        return $test->results();
    }

    /**
     * @retrun array
     */
    public function testgetLabels()
    {
        $test      = $this->newTest();
        $user      = UserFaker::create();
        $preset    = PresetFaker::create($user);
        $room      = RoomFaker::create($user, $preset);
        $label1    = LabelFaker::create();
        $label2    = LabelFaker::create();
        $roomlabel = RoomLabelFaker::create($room, $label1);
        $roomlabel = RoomLabelFaker::create($room, $label2);
        $labels    = [$label1->getLabelInfos(), $label2->getLabelInfos()];

        $test->expect($labels === $room->getLabels($room->id), 'getLabels() returned room labels');

        return $test->results();
    }

    /**
     * @param Base $f3
     *
     * @return array
     */
    public function testCollectAllByUserId($f3)
    {
        $test      = $this->newTest();
        $room      = new Room(\Registry::get('db'));
        $user      = UserFaker::create();
        $preset    = PresetFaker::create($user);
        $roomlabel = new RoomLabel(\Registry::get('db'));
        $roomlabel->erase(['']);
        $room->erase(['']); // Cleaning the table for test.

        $room1 = RoomFaker::create($user, $preset);
        $room2 = RoomFaker::create($user, $preset);

        $data1 = ['id' => $room1->id, 'name' => $room1->name, 'short_link' => $room1->short_link];
        $data2 = ['id' => $room2->id, 'name' => $room2->name, 'short_link' => $room2->short_link];
        $data  = [$data1, $data2];

        $test->expect(empty(array_udiff($data, $room->collectAllByUserId($user->id), fn ($obj1, $obj2) => $obj1 === $obj2)), 'CollectAllByUserId(' . $user->id . ') returned all rooms for the given user');

        return $test->results();
    }
}
