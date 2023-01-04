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
use BigBlueButton\Core\ApiMethod;
use BigBlueButton\Parameters\CreateMeetingParameters;
use BigBlueButton\Parameters\GetMeetingInfoParameters;
use BigBlueButton\Parameters\JoinMeetingParameters;
use BigBlueButton\Responses\CreateMeetingResponse;
use BigBlueButton\Responses\GetMeetingInfoResponse;
use BigBlueButton\Util\UrlBuilder;
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
            $serverSecret = $this->f3->get('bbb.shared_secret');
            $serverUrl    = $this->f3->get('bbb.server');
            $urlBuilder   = new UrlBuilder($serverSecret, $serverUrl);
            $bbbRequester = new BigBlueButtonRequester();

            // get room meeting id
            $meetingId = $room->meeting_id;

            // call meeting info to check if meeting is running
            $result = $this->getMeetingInfo($meetingId, $urlBuilder, $bbbRequester);
            if (null === $result) {
                return;
            }
            $response = new GetMeetingInfoResponse(new \SimpleXMLElement($result['body']));

            $moderatorPw = '';
            if ($response->success()) {
                $moderatorPw = $response->getMeeting()->getModeratorPassword();
            } else {
                // meeting not found
                if ('notFound' === $response->getMessageKey()) {
                    // create new meeting with the same meetingId
                    $createResult = $this->createMeeting($meetingId, $urlBuilder, $bbbRequester);
                    if (null === $createResult) {
                        return;
                    }
                    $moderatorPw = $createResult;
                }
            }

            $this->joinMeeting($meetingId, $moderatorPw, $urlBuilder, $bbbRequester);
        } else {
            $this->logger->error($errorMessage);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }

    public function getMeetingInfo(string $meetingId, UrlBuilder $urlBuilder, BigBlueButtonRequester $bbbRequester)
    {
        $getInfosParams     = new GetMeetingInfoParameters($meetingId);
        $getInfosQuery      = $getInfosParams->getHTTPQuery();
        $getInfosBuildQuery = $urlBuilder->buildQs(ApiMethod::GET_MEETING_INFO, $getInfosQuery);
        $this->logger->info('Received request to fetch meeting info.', ['meetingID' => $meetingId]);
        $result = $bbbRequester->proxyApiRequest(ApiMethod::GET_MEETING_INFO, $getInfosBuildQuery, 'GET');
        if (!$bbbRequester->isValidResponse($result)) {
            $this->logger->error('Could not fetch a meeting due to an error.');
            $this->renderXmlString($result);

            return null;
        }
        $this->logger->info('Meeting info successfully fetched from server.', ['meetingID' => $meetingId]);

        return $result;
    }

    public function createMeeting(string $meetingId, UrlBuilder $urlBuilder, BigBlueButtonRequester $bbbRequester)
    {
        $createParams = new CreateMeetingParameters($meetingId, 'meeting-' . $meetingId);
        $createParams->setModeratorPassword(DataUtils::generateRandomString());
        $createParams->setAttendeePassword(DataUtils::generateRandomString());
        $createParams->setRecord('true');
        $createQuery      = $createParams->getHTTPQuery();
        $createBuildQuery = $urlBuilder->buildQs(ApiMethod::CREATE, $createQuery);

        $this->logger->info('Received request to create a new meeting.', ['meetingID' => $meetingId]);
        $result = $bbbRequester->proxyApiRequest(ApiMethod::CREATE, $createBuildQuery, 'POST');
        if (!$bbbRequester->isValidResponse($result)) {
            $this->logger->error('Could not create a meeting due to an error.');
            $this->renderXmlString($result);

            return null;
        }
        $response = new CreateMeetingResponse(new \SimpleXMLElement($result['body']));
        if ($response->failed()) {
            $this->logger->warning('Meeting could be created.');
            $this->renderXmlString($result['body']);

            return null;
        }
        $this->logger->info('Meeting successfully created.', ['meetingID' => $meetingId, 'internal_meeting_id' => $response->getInternalMeetingId()]);

        return $createParams->getModeratorPassword();
    }

    public function joinMeeting(string $meetingId, string $moderatorPw, UrlBuilder $urlBuilder, BigBlueButtonRequester $bbbRequester): void
    {
        $joinParams = new JoinMeetingParameters($meetingId, $this->session->get('user.username'), $moderatorPw);
        $joinParams->setRedirect('true');
        $joinQuery      = $joinParams->getHTTPQuery();
        $joinBuildQuery = $urlBuilder->buildQs(ApiMethod::JOIN, $joinQuery);

        $this->logger->info('Meeting join request is going to redirect to the web client.', ['meetingID' => $meetingId]);
        $bbbRequester->proxyApiRequest(ApiMethod::JOIN, $joinBuildQuery, 'GET', true);
    }
}
