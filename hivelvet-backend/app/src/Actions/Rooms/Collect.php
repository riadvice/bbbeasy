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

namespace Actions\Rooms;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Room;
use Models\User;

/**
 * Class Collect.
 */
class Collect extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function show($f3, $params): void
    {
        $room   = new Room();
        $data   = [];
        $userId = $f3->get('PARAMS.user_id');
        $user   = new User();
        $user   = $user->getById($userId);
        if (!$user->dry()) {
            $rooms = $room->collectAllByUserId($userId);
            if ($rooms) {
                foreach ($rooms as $room) {
                    $r = new Room();

                    $room['labels'] = $r->getLabels($room['id']);
                    $data[]         = $room;
                }
            }
        } else {
            $this->logger->error('User not found');
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
        $this->logger->debug('Collecting rooms');
        $this->renderJson($data);
    }
}
