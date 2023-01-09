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
use BigBlueButton\Parameters\CreateMeetingParameters;
use BigBlueButton\Parameters\GetMeetingInfoParameters;
use BigBlueButton\Parameters\JoinMeetingParameters;
use Enum\ResponseCode;
use Models\Room;
use Utils\BigBlueButtonRequester;
use Utils\DataUtils;

/**
 * Class Start.
 */
class Start extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     *
     * @throws \Exception
     */
    public function execute($f3, $params): void
    {
        $id           = $params['id'];
        $errorMessage = 'Room Meeting could not be started';

        $room = new Room();
        $room = $room->getById($id);
        if ($room->valid()) {
            $bbbRequester = new BigBlueButtonRequester();

            // get room meeting id
            $meetingId = $room->meeting_id;

            // call meeting info to check if meeting is running
            $getMeetingInfoResponse = $this->getMeetingInfo($meetingId, $bbbRequester);
            if (null === $getMeetingInfoResponse) {
                return;
            }

            $moderatorPw = '';
            if ($getMeetingInfoResponse->success()) {
                $moderatorPw = $getMeetingInfoResponse->getMeeting()->getModeratorPassword();
            } else {
                // meeting not found
                if ('notFound' === $getMeetingInfoResponse->getMessageKey()) {
                    // create new meeting with the same meetingId
                    $createResult = $this->createMeeting($meetingId, $bbbRequester);
                    if (null === $createResult) {
                        return;
                    }
                    $moderatorPw = $createResult;
                }
            }

            $this->joinMeeting($meetingId, $moderatorPw, $bbbRequester);
        } else {
            $this->logger->error($errorMessage);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }

    public function getMeetingInfo(string $meetingId, BigBlueButtonRequester $bbbRequester)
    {
        $getInfosParams      = new GetMeetingInfoParameters($meetingId);
        $meetingInfoResponse = $bbbRequester->getMeetingInfo($getInfosParams);
        $this->logger->info('Received request to fetch meeting info.', ['meetingID' => $meetingId]);
        if (!$meetingInfoResponse->success()) {
            $this->logger->error('Could not fetch a meeting due to an error.');
            $this->renderXmlString($meetingInfoResponse->getRawXml());

            return null;
        }
        $this->logger->info('Meeting info successfully fetched from server.', ['meetingID' => $meetingId]);

        return $meetingInfoResponse;
    }

    public function createMeeting(string $meetingId, BigBlueButtonRequester $bbbRequester)
    {
        $createParams = new CreateMeetingParameters($meetingId, 'meeting-' . $meetingId);
        $createParams->setModeratorPassword(DataUtils::generateRandomString());
        $createParams->setAttendeePassword(DataUtils::generateRandomString());
        // @todo : set later via presets
        $createParams->setRecord('true');

        $this->logger->info('Received request to create a new meeting.', ['meetingID' => $meetingId]);
        $createMeetingResponse = $bbbRequester->createMeeting($createParams);
        if ($createMeetingResponse->failed()) {
            $this->logger->warning('Meeting could not be created.');
            $this->renderXmlString($createMeetingResponse->getRawXml());

            return null;
        }
        $this->logger->info(
            'Meeting successfully created.',
            ['meetingID' => $meetingId, 'internal_meeting_id' => $createMeetingResponse->getInternalMeetingId()]
        );

        return $createParams->getModeratorPassword();
    }

    public function joinMeeting(string $meetingId, string $moderatorPw, BigBlueButtonRequester $bbbRequester): void
    {
        $joinParams = new JoinMeetingParameters($meetingId, $this->session->get('user.username'), $moderatorPw);
        $joinParams->setRedirect('true');

        $this->logger->info(
            'Meeting join request is going to redirect to the web client.',
            ['meetingID' => $meetingId]
        );
        $this->f3->reroute($bbbRequester->getJoinMeetingURL($joinParams));
    }
}
