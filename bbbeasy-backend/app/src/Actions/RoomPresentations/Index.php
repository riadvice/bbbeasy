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

namespace Actions\RoomPresentations;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\RoomPresentations;

/**
 * Class Index.
 */
class Index extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        $room_presentations   = new RoomPresentations();
        $data   = [];
        $roomId = $f3->get('PARAMS.room_id');
        $roomPresentations   = new RoomPresentations();
        $roomPresentations  = $roomPresentations->getById($roomId);
        if (!$roomPresentations->dry()) {
            $roomPresentations = $room_presentations->collectAllByUserId($roomId);
            if ($roomPresentations) {
                foreach ($roomPresentations as $presentation) {
                    $data[]         = $presentation;
                }
            }
        } else {
            $this->logger->error('Presentation not found');
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
        $this->logger->debug('Collecting room presentations');
        $this->renderJson($data);
    }
}
