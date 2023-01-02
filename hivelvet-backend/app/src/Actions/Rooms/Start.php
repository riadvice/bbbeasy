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
use BigBlueButton\Responses\CreateMeetingResponse;
use Utils\BigBlueButtonRequester;
use Utils\URLUtils;

/**
 * Class Start.
 */
class Start extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        $bbbRequester = new BigBlueButtonRequester();
        $meetingName  = bin2hex(openssl_random_pseudo_bytes(8));
        $params       = [
            'meetingID'   => 'random-' . $meetingName,
            'name'        => $meetingName,
            'fullName'    => $this->session->get('user.username'),
            'moderatorPW' => 'mp',
            'password'    => 'mp',
            'attendeePW'  => 'ap',
            'record'      => 'true',
            'redirect'    => 'true',
        ];
        $queryBuild = http_build_query($params);
        $checksum   = URLUtils::calculateOutgoingChecksum(ApiMethod::CREATE, $queryBuild, 40, $this->f3->get('bbb.shared_secret'));

        $this->logger->info('Received request to create a new meeting.', ['meetingID' => $params['meetingID']]);
        $result = $bbbRequester->proxyApiRequest(ApiMethod::CREATE, $queryBuild . '&checksum=' . $checksum, 'GET');
        if (!$bbbRequester->isValidResponse($result)) {
            $this->logger->error('Could not create a meeting due to an error.');
            $this->renderXmlString($result);

            return;
        }
        $response = new CreateMeetingResponse(new \SimpleXMLElement($result['body']));
        if ($response->failed()) {
            $this->logger->warning('Meeting could be created.');
            $this->renderXmlString($result['body']);

            return;
        }

        $this->logger->info('Meeting successfully created.', ['meetingID' => $response->getMeetingId(), 'internal_meeting_id' => $response->getInternalMeetingId()]);

        $this->logger->info('Meeting join request is going to redirect to the web client.', ['meetingID' => $response->getMeetingId()]);
        $bbbRequester->proxyApiRequest(ApiMethod::JOIN, $queryBuild . '&checksum=' . $checksum, 'GET', true);
    }
}
