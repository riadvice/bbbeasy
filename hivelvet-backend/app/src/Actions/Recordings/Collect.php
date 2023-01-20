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

namespace Actions\Recordings;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Models\Room;

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
    public function execute($f3, $params): void
    {
        $data            = [];
        $recordingStates = [
            'publishing', 'published',
            'processing', 'processed',
            'unpublishing', 'unpublished',
            'deleting', 'deleted',
        ];
        $room  = new Room();
        $rooms = $room->find();
        if ($rooms) {
            $meetingsIds = $rooms->castAll(['meeting_id']);
            foreach ($meetingsIds as $meeting) {
                $meetingId         = $meeting['meeting_id'];
                $meetingRecordings = $room->getRecordingsByRoomMeetingId($meetingId);
                if (null !== $meetingRecordings) {
                    $data = array_merge($data, $meetingRecordings);
                }
            }
        }

        $this->logger->debug('collecting recordings', ['recordings' => json_encode($data)]);
        $this->renderJson(['recordings' => $data, 'states' => $recordingStates]);
    }
}