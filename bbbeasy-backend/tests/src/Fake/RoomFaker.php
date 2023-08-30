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

namespace Fake;

use Faker\Factory as Faker;
use Models\Preset;
use Models\Room;
use Models\User;
use Utils\DataUtils;

class RoomFaker
{
    private static array $storage = [];

    public static function create(User $user, Preset $preset, string $shortLink = null, $storageName = null)
    {
        $faker            = Faker::create();
        $room             = new Room();
        $room->name       = $faker->name;
        $room->short_link = $shortLink ?? $faker->text(14);
        $room->preset_id  = $preset->id;
        $room->user_id    = $user->id;
        $name             = $room->name;
        $link             = $room->short_link;
        $room->meeting_id = DataUtils::generateRandomString();

        $room->save();

        if (null !== $storageName) {
            self::$storage[$storageName] = $room;
        }

        return $room->getByNameAndLink($name, $link);
    }
}
