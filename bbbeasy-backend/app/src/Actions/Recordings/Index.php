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

namespace Actions\Recordings;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Room;

/**
 * Class Index.
 */
class Index extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param mixed $f3
     * @param mixed $params
     *
     * @throws \JsonException
     */
    public function show($f3, $params): void
    {
        $roomId = $f3->get('PARAMS.room_id');
        $room   = new Room();
        $room   = $room->getById($roomId);
        if (!$room->dry()) {
            $data              = [];
            $meetingId         = $room->meeting_id;
            $meetingRecordings = $room->getRecordingsByRoomMeetingId($meetingId);
            if (null !== $meetingRecordings) {
                $data = array_merge($data, $meetingRecordings);
            }

            $this->logger->debug('collecting room recordings', ['roomID' => $room->id, 'recordings' => json_encode($data)]);
            $this->renderJson($data);
        } else {
            $this->logger->error('Room not found');
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
