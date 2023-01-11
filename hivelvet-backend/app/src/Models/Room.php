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

use Enum\ResponseCode;
use Models\Base as BaseModel;

/**
 * Class Room.
 *
 * @property int       $id
 * @property string    $name
 * @property string    $meeting_id
 * @property string    $short_link
 * @property int       $preset_id
 * @property int       $user_id
 * @property Label[]   $labels
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 */
class Room extends BaseModel
{
    protected $fieldConf = [
        'preset_id' => [
            'belongs-to-one' => Preset::class,
        ],
    ];

    protected $table = 'rooms';

    public function nameExists($name, $userId, $id = null)
    {
        return $this->load(['lower(name) = ? and user_id = ? and id != ?', mb_strtolower($name), $userId, $id]);
    }

    /**
     * Get room record by link.
     *
     * @param mixed $link
     *
     * @return $this
     */
    public function getByLink($link): self
    {
        $this->load(['short_link = ?', $link]);

        return $this;
    }

    public function meetingIdExists($meetingId)
    {
        return $this->load(['meeting_id = ?', $meetingId]);
    }

    public function shortlinkExists($shortlink)
    {
        return $this->load(['short_link = ?', $shortlink]);
    }

    /**
     * Get room record by id value.
     *
     * @param mixed $id
     *
     * @return $this
     */
    public function getById($id): self
    {
        $this->load(['id = ?', $id]);

        return $this;
    }

    public function collectAllByUserId($userId): array
    {
        return $this->db->exec('SELECT id, name, short_link, preset_id FROM rooms where user_id =?', $userId);
    }

    public function collectAllByPresetId($presetId): array
    {
        return $this->db->exec('SELECT id, name, short_link, preset_id ,user_id FROM rooms where preset_id =?', $presetId);
    }

    public function collectAll(): array
    {
        $data  = [];
        $rooms = $this->find([], ['order' => 'id']);
        if ($rooms) {
            foreach ($rooms as $room) {
                $data[] = $room->getRoomInfos($room->id);
            }
        }

        return $data;
    }

    public function getRoomInfos($id): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'preset_id'  => $this->getPresetID($this->id)['preset_id'],
            'user_id'    => $this->getUserID($this->id)['user_id'],
            'short_link' => $this->short_link,
            'labels'     => $this->getLabels($this->id),
        ];
    }

    public function getPresetID($id)
    {
        if ($id) {
            $subQuery = 'WHERE r.id = :room_id';
            $params   = [':room_id' => $id];
        }
        $result = $this->db->exec(
            'SELECT
                 p.id AS preset_id
            FROM
                rooms r
            LEFT JOIN presets p ON r.preset_id = p.id ' . $subQuery,
            $params
        );

        return $id ? $result[0] : $result;
    }

    public function getUserID($id)
    {
        if ($id) {
            $subQuery = 'WHERE r.id = :room_id';
            $params   = [':room_id' => $id];
        }
        $result = $this->db->exec(
            'SELECT
                 u.id AS user_id
            FROM
                rooms r
            LEFT JOIN users u ON r.user_id = u.id ' . $subQuery,
            $params
        );

        return $id ? $result[0] : $result;
    }

    public function getLabels($room): array
    {
        $roomlabel = new RoomLabel();

        $roomlabels = $roomlabel->collectAllByRoomId($room);
        $lbs        = [];
        if ($roomlabels) {
            foreach ($roomlabels as $rl) {
                $label = new Label();

                $labels = $label->getById($rl['label_id']);
                if ($labels) {
                    $lbs[] = $labels->getLabelInfos();
                }
            }
        }

        return $lbs;
    }

    /**
     * Delete a room if it's allowed and  removing its associated roomlabels.
     *
     * @return Array[2](Array[], ResponsCode)
     */
    public function delete(): array
    {
        // delete associated roomslabels
        $result = $this->deleteRoomsLabels();

        if ($result) {
            try {
                $this->erase();
                $this->logger->info('Room successfully deleted', ['room' => $this->toArray()]);
            } catch (\Exception $e) {
                $this->logger->error('room could not be deleted', ['room' => $this->toArray(), 'error' => $e->getMessage()]);

                throw $e;
            }

            return [['result' => 'success'], ResponseCode::HTTP_OK];
        }

        return [[], ResponseCode::HTTP_FORBIDDEN];
    }

    public function deleteRoomsLabels(): bool
    {
        $this->logger->info('Starting delete rooms labels transaction.');
        $this->db->begin();
        $roomId = $this->id;

        $roomlabel    = new RoomLabel();
        $deleteResult = $roomlabel->erase(['room_id = ?', $roomId]);
        if ($deleteResult) {
            $this->logger->info('All Rooms Labels successfully deleted');
            $this->db->commit();
            $this->logger->info('Delete rooms and its associations transaction successfully commit.');

            return true;
        }

        return false;
    }
}
