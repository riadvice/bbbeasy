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

use Enum\ResponseCode;
use Models\Base as BaseModel;

/**
 * Class Label.
 *
 * @property int       $id
 * @property string    $name
 * @property text      $description
 * @property string    $color
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 */
class Label extends BaseModel
{
    protected $table = 'labels';

    public function __construct($db = null, $table = null, $fluid = null, $ttl = 0)
    {
        parent::__construct($db, $table, $fluid, $ttl);
    }

    /**
     * Get label record by id value.
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

    /**
     * Get label record by color.
     *
     * @param mixed $color
     *
     * @return $this
     */
    public function getByColor($color): self
    {
        if ('array' === \gettype($color)) {
            $color = $color['value'];
        }

        $this->load(['color = ?', $color]);

        return $this;
    }

    /**
     *check if color is already in use .
     *
     * @param null $id
     *
     * @return bool
     */
    public function colorExists(string $color, $id = null)
    {
        return $this->load(['color = ? and id != ?', $color, $id]);
    }

    public function getAllLabels()
    {
        $data   = [];
        $labels = $this->find([], ['order' => 'id']);
        if ($labels) {
            foreach ($labels as $label) {
                $data[] = $label->getLabelInfos();
            }
        }

        return $data;
    }

    public function saveLabel($name, $description, $color, $successMessage, $errorMessage): bool|string
    {
        try {
            $this->name        = $name;
            $this->description = $description;
            $this->color       = $color;

            $this->save();
            $this->getByColor($color);
        } catch (\Exception $e) {
            $this->logger->error($errorMessage, ['label' => $this->toArray(), 'error' => $e->getMessage()]);

            return false;
        }

      $this->logger->info($successMessage, ['label' => $this->toArray()]);

        return true;
    }

    public function getLabelInfos(): array
    {
        return [
            'key'         => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'color'       => $this->color,
            'nb_rooms'    => \count($this->getRooms($this->id)),
        ];
    }

    public function getLabelByNameAndColor($name, $color)
    {
        $this->load(['name = ? and color = ?', $name, $color]);

        return $this;
    }

    public function getRooms($labelId): array
    {
        $roomlabel = new RoomLabel();

        $roomlabels = $roomlabel->collectAllByLabelId($labelId);

        $data = [];
        if ($roomlabels) {
            foreach ($roomlabels as $rl) {
                if (!\in_array($rl['room_id'], $data, true)) {
                    $data[] = $rl['room_id'];
                }
            }
        }

        return $data;
    }

    public function deleteRoomsLabels(int $roomId = null): bool
    {
        $this->logger->info('Starting delete rooms labels transaction.');
        $this->db->begin();
        $labelId = $this->id;

        $isRoom       = null !== $roomId;
        $text         = $isRoom ? 'rooms' : 'labels';
        $roomLabel    = new RoomLabel();
        $deleteResult = $isRoom ? $roomLabel->erase(['room_id = ?', $roomId]) : $roomLabel->erase(['label_id = ?', $labelId]);

        if ($deleteResult) {
            $this->logger->info('All Rooms Labels successfully deleted');
            $this->db->commit();
            $this->logger->info('Delete ' . $text . ' and its associations transaction successfully commit.');

            return true;
        }

        return false;
    }

    /**
     * Delete a label if it's allowed and  removing its associated roomlabels.
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
                $this->logger->info('Label successfully deleted', ['label' => $this->toArray()]);
            } catch (\Exception $e) {
                $this->logger->error('label could not be deleted', ['label' => $this->toArray(), 'error' => $e->getMessage()]);

                throw $e;
            }

            return [['result' => 'success'], ResponseCode::HTTP_OK];
        }

        return [[], ResponseCode::HTTP_FORBIDDEN];
    }
}
