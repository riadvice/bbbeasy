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
use BigBlueButton\Parameters\GetMeetingInfoParameters;
use Enum\ResponseCode;
use Models\Preset;
use Models\Room;
use Utils\BigBlueButtonRequester;
use Utils\PresetProcessor;

/**
 * Class GetRoom.
 */
class GetRoom extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function show($f3, $params): void
    {
        $room = new Room();
        $data = [];
        $link = $params['link'];
        $room = new Room();
        $room = $room->getByLink($link);
        if (!$room->dry()) {
            $this->logger->debug('Collecting room by its Link');
            $bbbRequester        = new BigBlueButtonRequester();
            $getInfosParams      = new GetMeetingInfoParameters($room->meeting_id);
            $meetingInfoResponse = $bbbRequester->getMeetingInfo($getInfosParams);
            $canstart            = false;
            $preset              = new Preset();
            $p                   = $preset->findById($room->getPresetID($room->id)['preset_id']);
            $presetProcessor     = new PresetProcessor();
            $presetData          = $presetProcessor->preparePresetData($p->getMyPresetInfos($p));

            if (!$meetingInfoResponse->success()) {
                if ('notFound' === $meetingInfoResponse->getMessageKey()) {
                    $anyonestart = false;

                    if ($room->getRoomInfos($room->id)['user_id'] === $this->session->get('user.id') || $presetData['General']['anyone_can_start']) {
                        $canstart = true;
                    }
                }
            }

            $meeting             = (array) $meetingInfoResponse->getRawXml();
            $meeting['canStart'] = $canstart;

            $meeting['auto_join'] = $presetData['Audio']['auto_join'];

            $this->renderJson(['room' => $room->getRoomInfos($room->id), 'meeting' => $meeting]);
        } else {
            $this->logger->error('Link not found');
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
