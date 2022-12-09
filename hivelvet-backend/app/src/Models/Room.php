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

use DateTime;
use Models\Label;
use Enum\ResponseCode;
use Enum\UserStatus;
use Models\Base as BaseModel;


/**
 * Class Room.
 *
 * @property int      $id
 * @property string   $name
 * @property string   $short_link
 * @property int      $preset_id
 * @property Label[]  $labels
 *  @property DateTime $created_on
 * @property DateTime $updated_on

 *

 */
class Room extends BaseModel
{
    protected $fieldConf = [
        'preset_id' => [
            'belongs-to-one' => Preset::class,
        ],
    ];

    protected $table = 'rooms';
    public function nameExists($name)
    {
        return $this->load(['lower(name) = ?', mb_strtolower($name)]);
    }
    public function shortlinkExists($shortlink)
    {
        return $this->load(['short_link = ?',  $shortlink]);
    }

    public function collectAll(): array
    {
        return $this->db->exec('SELECT id, name, short_link, preset_id FROM rooms');
    }

    public function getRoomInfos(int $id = null): array
    {
        if ($id) {
            $subQuery = 'WHERE r.id = :room_id';
            $params   = [':room_id' => $id];
        }
        $result = $this->db->exec(
            'SELECT
                r.id AS key, r.name, r.short_link,  p.name AS preset
            FROM
                rooms r
            LEFT JOIN presets p ON r.preset_id = p.id ' . $subQuery,
            $params
        );


        return $id ? $result[0] : $result;
    }
    public function getLabels( $room):array{
        $roomlabel=new RoomLabel();

        $roomlabels=$roomlabel->collectAllByRoomId($room);
         $lbs=[];
        if($roomlabels){
            foreach ($roomlabels as $rl){

                $label=new Label();
                $labels=$label->getById($rl["label_id"]);
                if($labels){


                    $lbs[]=$labels->getLabelInfos();

                }
            }

        }

        return $lbs;
    }
}
