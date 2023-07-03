<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBEasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

namespace Models;

use Models\Base as BaseModel;

/**
 * Class RoomPresentations.
 *
 * @property int       $id
 * @property string    $file_name
 * @property int       $room_id
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 */
class Presentations extends BaseModel
{
    protected $table = 'room_presentations';

    public function __construct($db = null, $table = null, $fluid = null, $ttl = 0)
    {
        parent::__construct($db, $table, $fluid, $ttl);
        $this->onset('name', fn ($self, $value) => $self->f3->snakecase($value));
    }

    public function collectAllByUserId($roomId): array
    {
        return $this->db->exec('SELECT id as uid, file_name as url, room_id FROM room_presentations where room_id =?', $roomId);
    }

    public function delete($id): array
    {
        return $this->db->exec('DELETE FROM room_presentations where id =?', $id);
    }

    public function DeleteAllRoomPresentation($roomId)
    {
        return $this->db->exec('DELETE FROM room_presentations where room_id =?', $roomId);
    }
    /**
     * Get user record by id value.
     *
     * @param mixed $id
     *
     * @return $this
     */
    public function getById($id): self
    {
        $this->load(['room_id = ?', $id]);

        return $this;
    }

    public function findById($id)
    {
        $this->load(['id = ? ', $id]);
        return $this;
    }

    public function nameExists($name, $userId, $id = null)
    {
        return $this->load(['lower(name) = ? and user_id = ? and id != ?', mb_strtolower($name), $userId, $id]);
    }

    public function getByName($name): self
    {
        $this->load(['name = ? ', $name]);
        return $this;
    }

}
