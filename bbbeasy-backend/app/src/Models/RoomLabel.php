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

    /**
     * Get label record by Room and label.
     *
     * @param mixed $room_id
     * @param mixed $label_id
     *
     * @return $this
     */
    public function getByRoomAndLabel($room_id, $label_id): self
    {
        $this->load(['room_id = ? and label_id = ?', $room_id, $label_id]);

        return $this;
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

    public function roomAndLabelExists($room, $label, $id = null)
    {
        return $this->load(['room_id = ? and label_id = ? and id != ?', $room, $label, $id]);
    }
}
