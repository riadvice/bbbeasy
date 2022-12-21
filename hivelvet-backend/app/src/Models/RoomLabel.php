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

use Models\Base as BaseModel;

/**
 * Class Room.
 *
 * @property int       $id
 * @property int       $label_id
 * @property int       $room_id
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 */
class RoomLabel extends BaseModel
{
    protected $fieldConf = [
        'room_id' => [
            'belongs-to-one' => Room::class,
        ],
        'label_id' => [
            'belongs-to-one' => Label::class,
        ],
    ];

    protected $table = 'rooms_labels';

    public function collectAll(): array
    {
        return $this->db->exec('SELECT id, room_id, label_id FROM rooms_labels');
    }

    /**
     * @param mixed $roomId
     */
    public function collectAllByRoomId($roomId): array
    {
        return $this->db->exec('SELECT id, room_id, label_id FROM rooms_labels where room_id = ? ', $roomId);
    }

    /**
     * @param mixed $labelId
     */
    public function collectAllByLabelId($labelId): array
    {
        return $this->db->exec('SELECT id, room_id, label_id FROM rooms_labels where label_id = ? ', $labelId);
    }
}
