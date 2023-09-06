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

use Enum\UserRole;
use Fake\LabelFaker;
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
final class AddTest extends Scenario
{
    final protected const ADD_ROOM_ROUTE = 'POST /rooms';
    protected $group                     = 'Action Room Add';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testEmptyData($f3)
    {
        $test = $this->newTest();

        $data = ['data' => ['name' => '', 'shortlink' => '', 'preset' => '', 'labels' => []], 'user_id' => ''];
        $f3->mock(self::ADD_ROOM_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('room/empty_error.json'), 'Add room with an empty data shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingUser($f3)
    {
        $test = $this->newTest();

        $faker  = Faker::create();
        $user   = UserFaker::create();
        $preset = PresetFaker::create($user);
        $label  = LabelFaker::create();
        $data   = ['data' => ['name' => $faker->name, 'shortlink' => $faker->text(14), 'preset' => $preset->id, 'labels' => [$label->color]], 'user_id' => 404];
        $f3->mock(self::ADD_ROOM_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Add room with non existing user id "404" shown an error');

        return $test->results();
    }

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

        $faker = Faker::create();
        $user  = UserFaker::create();
        $label = LabelFaker::create();
        $data  = ['data' => ['name' => $faker->name, 'shortlink' => $faker->text(14), 'preset' => 404, 'labels' => [$label->color]], 'user_id' => $user->id];
        $f3->mock(self::ADD_ROOM_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Add room with non existing preset id "404" shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testInvalidLabels($f3)
    {
        $test = $this->newTest();

        $faker = Faker::create();
        $user  = UserFaker::create();
        $data  = ['data' => ['name' => $faker->name, 'shortlink' => $faker->text(14), 'preset' => 404, 'labels' => ['#fsbbcz%0b']], 'user_id' => $user->id];
        $f3->mock(self::ADD_ROOM_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'Add room with non existing  labels shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testExistingNameOrLink($f3)
    {
        $test = $this->newTest();

        $user1  = UserFaker::create(UserRole::LECTURER);
        $user2  = UserFaker::create(UserRole::LECTURER);
        $preset = PresetFaker::create($user1);
        $label  = LabelFaker::create();
        $faker  = Faker::create();
        $room   = RoomFaker::create($user1, $preset);

        $data = ['data' => ['name' => $room->name, 'shortlink' => $faker->text(14), 'preset' => $preset->id, 'labels' => [$label->color]], 'user_id' => $user1->id];
        $f3->mock(self::ADD_ROOM_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('room/exist_error.json'), 'Add room with an existing name "' . $room->name . '" to user "' . $user1->id . '" shown an error');

        $data = ['data' => ['name' => $faker->name, 'shortlink' => $room->short_link, 'preset' => $preset->id, 'labels' => [$label->color]], 'user_id' => $user1->id];
        $f3->mock(self::ADD_ROOM_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('room/exist_error.json'), 'Add room with an existing Link "' . $room->short_link . '" shown an error');

        $data = ['data' => ['name' => $room->name, 'shortlink' => $room->short_link, 'preset' => $preset->id, 'labels' => [$label->color]], 'user_id' => $user1->id];
        $f3->mock(self::ADD_ROOM_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('room/exist_error.json'), 'Add room with an existing room "' . $room->name . '"and existing link "' . $room->short_link . 'to user "' . $user1->id . '" shown an error');

        $data = ['data' => ['name' => $faker->name, 'shortlink' => $room->short_link, 'preset' => $preset->id, 'labels' => [$label->color]], 'user_id' => $user2->id];
        $f3->mock(self::ADD_ROOM_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareTemplateToResponse('room/exist_error.json'), 'Add room with an existing link "' . $room->short_link . 'to another user "' . $user2->id . '" shown an error');

        $data = ['data' => ['name' => $room->name, 'shortlink' => $faker->text(14), 'preset' => $preset->id, 'labels' => [$label->color]], 'user_id' => $user2->id];
        $f3->mock(self::ADD_ROOM_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Add room with an existing name "' . $room->name . '" to another user "' . $user2->id . '" pass');

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

        $user   = UserFaker::create(UserRole::LECTURER);
        $preset = PresetFaker::create($user);
        $label  = LabelFaker::create();
        $faker  = Faker::create();
        $data   = ['data' => ['name' => $faker->name, 'shortlink' => $faker->text(14), 'preset' => $preset->id, 'labels' => [$label->color]], 'user_id' => $user->id];
        $f3->mock(self::ADD_ROOM_ROUTE, null, null, $this->postJsonData($data));
        $test->expect($this->compareArrayToResponse(['result' => 'success']), 'Add room with a valid data');

        return $test->results();
    }
}
