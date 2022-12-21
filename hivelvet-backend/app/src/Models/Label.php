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
        $this->onset('name', fn ($self, $value) => $self->f3->snakecase($value));
    }

    /**
     * Get label record by id value.
     *
     * @return $this
     */
    public function getById(int $id): self
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
        $this->load(['color = ?', $color]);

        return $this;
    }

    /**
     *check if name is already in use .
     *
     * @param null $id
     *
     * @return bool
     */
    public function nameExists(string $name, $id = null)
    {
        return $this->load(['lower(name) = ? and id != ?', mb_strtolower($this->f3->snakecase($name)), $id]);
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

    public function getRooms($labelId): array
    {
        $roomlabel  = new RoomLabel();
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
}
