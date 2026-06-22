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
use Models\User;
use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class ViewTest extends Scenario
{
    final protected const VIEW_ROOM_ROUTE = 'GET /rooms/get/';
    protected $group                      = 'Action Room View';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testNonExistingLink($f3)
    {
        $test = $this->newTest();

        $f3->mock(self::VIEW_ROOM_ROUTE . 404, null, null);
        $test->expect($this->compareTemplateToResponse('not_found_error.json'), 'View room with non existing shortLink "404" shown an error');

        return $test->results();
    }

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testValidLink($f3)
    {
        $test = $this->newTest();

        $loggedUser = new User();
        $loggedUser->load(['id = ?', [$f3->get('SESSION.user.id')]]);
        $preset = PresetFaker::create($loggedUser);
        $room   = RoomFaker::create($loggedUser, $preset, 'abcdef-123456');
        $f3->mock(self::VIEW_ROOM_ROUTE . $room->short_link, null, null);
        $test->expect($this->compareArrayToResponse(['room' => $room->getRoomInfos()]), 'View room with a valid shortLink');

        return $test->results();
    }
}
