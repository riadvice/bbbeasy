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

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use BigBlueButton\Parameters\GetMeetingInfoParameters;
use Enum\ResponseCode;
use Models\Preset;
use Models\Room;
use Utils\BigBlueButtonRequester;
use Utils\PresetProcessor;

/**
 * Class View.
 */
class View extends BaseAction
{
    use RequirePrivilegeTrait;

    public function beforeroute(): void
    {
        $link            = $this->f3->get('PARAMS.link');
        $room            = new Room();
        $room            = $room->getByLink($link);
        $preset          = new Preset();
        $p               = $preset->findById($room->getPresetID($room->id)['preset_id']);
        $presetProcessor = new PresetProcessor();
        $presetData      = $presetProcessor->preparePresetData($p->getMyPresetInfos($p));
        // var_dump($presetData['General']['open_for_everyone']);
        if (!$presetData['General']['open_for_everyone']) {
            $this->logger->warning('Access denied to route ' . $route . ' for subject ' . ($subject ?: 'unknown'));
            $this->f3->error(404);
        }
    }

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function show($f3, $params): void
    {
        $link = $params['link'];
        $room = new Room();
        $room = $room->getByLink($link);
        if (!$room->dry()) {
            $this->logger->debug('Collecting room by its Link');
            $bbbRequester   = new BigBlueButtonRequester();
            $getInfosParams = new GetMeetingInfoParameters($room->meeting_id);

            $meetingInfoResponse = $bbbRequester->getMeetingInfo($getInfosParams);
            $canStart            = false;
            $preset              = new Preset();
            $p                   = $preset->findById($room->getPresetID($room->id)['preset_id']);
            $presetProcessor     = new PresetProcessor();
            $presetData          = $presetProcessor->preparePresetData($p->getMyPresetInfos($p));

            if (!$meetingInfoResponse->success()) {
                if ('notFound' === $meetingInfoResponse->getMessageKey()) {
                    $anyonestart = false;

                    if ($room->getRoomInfos($room)['user_id'] === $this->session->get('user.id') || $presetData['General']['anyone_can_start']) {
                        $canStart = true;
                    }
                    if ($presetData['General']['anyone_can_start']) {
                        //  $this->f3->route('GET /rooms/get/'.$link,$this->show($f3,$params));
                    }
                }
            }

            $meeting             = (array) $meetingInfoResponse->getRawXml();
            $meeting['canStart'] = $canStart;

            $meeting['auto_join'] = $presetData['Audio']['auto_join'];

            $this->renderJson(['room' => $room->getRoomInfos($room), 'meeting' => $meeting]);
        } else {
            $this->logger->error('Link not found');
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
