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

namespace Actions\Rooms;

use Actions\Delete as DeleteAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Room;
use Models\RoomPresentations;

/**
 * Class Delete.
 */
class Delete extends DeleteAction
{
    use RequirePrivilegeTrait;

    public function execute($f3, $params): void
    {
        $room   = new Room();
        $roomId = $params['id'];
        $room->load(['id = ?', $roomId]);
        if ($room->valid()) {
                $roomPresentations = new RoomPresentations();
                $roomPresentations->DeleteAllRoomPresentation($roomId);
                $room->erase();
                $this->logger->info('Room Presentations successfully deleted', ['preset' => $roomId]);
                $this->renderJson(['result' => 'success']);

        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
