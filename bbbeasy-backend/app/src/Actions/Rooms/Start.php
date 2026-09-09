<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

namespace Actions\Rooms;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use BigBlueButton\Enum\Role;
use BigBlueButton\Parameters\Config\DocumentOptionsStore;
use BigBlueButton\Parameters\CreateMeetingParameters;
use BigBlueButton\Parameters\GetMeetingInfoParameters;
use BigBlueButton\Parameters\JoinMeetingParameters;
use BigBlueButton\Responses\GetMeetingInfoResponse;
use Enum\Presets\General;
use Enum\ResponseCode;
use Models\Preset;
use Models\Room;
use Utils\BigBlueButtonRequester;
use Utils\DataUtils;
use Utils\PresetProcessor;

/**
 * Class Start.
 */
class Start extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * Pre-upload the room presentations into the meeting (embedded content,
     * so the BBB server does not need to reach the application public URL).
     *
     * The embedded content is sent as the POST body of the /create request.
     * The BBB server (or its front proxy) rejects bodies above ~1 MB, so the
     * total raw size of the presentations must stay below this budget (base64
     * inflates the body by ~33 %).
     */
    private const PRE_UPLOAD_MAX_BYTES = 768000;

    /**
     * @throws \Exception
     */
    public function beforeroute(): void
    {
        $id = $this->f3->get('PARAMS.id');

        $room = new Room()->getById($id);

        // Nothing to authorise when the identifier matches no room, the action
        // itself answers with a not found.
        if ($room->dry()) {
            return;
        }

        $preset     = new Preset()->findById($room->getPresetID($room->id)['preset_id']);
        $presetData = new PresetProcessor()->preparePresetData($preset->getMyPresetInfos($preset));

        if (!$presetData[General::GROUP_NAME][General::OPEN_FOR_EVERYONE] && null === $this->session->get('user')) {
            $this->logger->warning('Access denied to route ');
            $this->f3->error(404);
        }
    }

    public function execute($f3, $params): void
    {
        $id           = $params['id'];
        $errorMessage = 'Room Meeting could not be started';
        $form         = $this->getDecodedBody();

        $fullname = (null !== $this->session->get('user') ? $this->session->get('user.username') : $form['fullname']);
        if (null !== $fullname) {
            $room = new Room();
            $room = $room->getById($id);
            if ($room->valid()) {
                $bbbRequester = new BigBlueButtonRequester();

                // get room meeting id
                $meetingId = $room->meeting_id;

                // call meeting info to check if meeting is running
                $getMeetingInfoResponse = $this->getMeetingInfo($meetingId, $bbbRequester);

                if (null === $getMeetingInfoResponse) {
                    $this->logger->error('Could not fetch a meeting due to an error.');
                    $this->renderJson(['meeting' => 'Could not start or join the meeting'], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
                }

                $preset          = new Preset()->findById($room->getPresetID($room->id)['preset_id']);
                $presetInfos     = $preset->getMyPresetInfos($preset);
                $presetProcessor = new PresetProcessor();
                $presetData      = $presetProcessor->preparePresetData($presetInfos);
                $isOwner         = $room->getRoomInfos()['user_id'] === $this->session->get('user.id');

                if (!$getMeetingInfoResponse->success()) {
                    if ('notFound' !== $getMeetingInfoResponse->getMessageKey()) {
                        $this->logger->error('Could not fetch a meeting due to an error.');
                        $this->renderJson(['meeting' => 'Could not start or join the meeting'], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        return;
                    }

                    if (!$isOwner && !$presetData[General::GROUP_NAME][General::ANYONE_CAN_START]) {
                        $this->renderJson(['meeting' => 'Meeting has not started yet'], ResponseCode::HTTP_NOT_FOUND);

                        return;
                    }

                    // The meeting is created with the same identifier the room carries.
                    if (null === $this->createMeeting($meetingId, $bbbRequester, $room->short_link, $presetInfos, $presetProcessor, $room)) {
                        return;
                    }
                }

                $role = $isOwner || $presetData[General::GROUP_NAME][General::ALL_JOIN_AS_MODERATOR]
                    ? Role::MODERATOR
                    : Role::VIEWER;

                $this->joinMeeting($meetingId, $role, $bbbRequester, $presetInfos, $fullname);
            } else {
                $this->logger->error($errorMessage);
                $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
            }
        } else {
            $this->logger->error('Fullname should not be empty');
            $this->renderJson(['meeting' => 'Could not join a meeting with an empty fullname'], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

            return;
        }
    }

    /**
     * Meeting state, or null when BigBlueButton could not be reached.
     *
     * @return null|GetMeetingInfoResponse
     */
    public function getMeetingInfo(string $meetingId, BigBlueButtonRequester $bbbRequester)
    {
        $getInfosParams = new GetMeetingInfoParameters($meetingId);
        $this->logger->info('Received request to fetch meeting info.', ['meetingID' => $meetingId]);

        $meetingInfoResponse = $bbbRequester->send(static fn () => $bbbRequester->getMeetingInfo($getInfosParams));

        if (null === $meetingInfoResponse) {
            return null;
        }

        $this->logger->info('Meeting info successfully fetched from server.', ['meetingID' => $meetingId]);

        return $meetingInfoResponse;
    }

    public function createMeeting(string $meetingId, BigBlueButtonRequester $bbbRequester, $link, $p, $preetprocessor, ?Room $room = null)
    {
        $presetProcessor = new PresetProcessor();
        $createParams    = new CreateMeetingParameters($meetingId, 'meeting-' . $meetingId);
        $createParams    = $presetProcessor->toCreateMeetingParams($p, $createParams);
        if (null !== $room) {
            $this->attachPresentations($createParams, $room);
        }
        $createParams->setModeratorPassword(DataUtils::generateRandomString());
        $createParams->setAttendeePassword(DataUtils::generateRandomString());
        // @todo : set later via presets

        $createParams->setModeratorOnlyMessage('to invite someone you can use this link ' . $this->roomUrl($link));

        // @fixme: delete after fixing the PHP library
        $createParams->setAllowRequestsWithoutSession(true);

        $this->logger->info('Received request to create a new meeting.', ['meetingID' => $meetingId]);
        $createMeetingResponse = $bbbRequester->send(static fn () => $bbbRequester->createMeeting($createParams));

        if (null === $createMeetingResponse || $createMeetingResponse->failed()) {
            $this->logger->warning('Meeting could not be created.');
            if (null === $createMeetingResponse) {
                $this->renderJson(['meeting' => 'Could not start or join the meeting'], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
            } else {
                $this->renderXmlString($createMeetingResponse->getRawXml());
            }

            return null;
        }
        $this->logger->info(
            'Meeting successfully created.',
            ['meetingID' => $meetingId, 'internal_meeting_id' => $createMeetingResponse->getInternalMeetingId()]
        );

        return $createParams->getModeratorPassword();
    }

    public function joinMeeting(string $meetingId, Role $role, BigBlueButtonRequester $bbbRequester, $p, $fullname): void
    {
        $joinParams      = new JoinMeetingParameters($meetingId, $fullname, $role);
        $presetProcessor = new PresetProcessor();

        $joinParams = $presetProcessor->toJoinParameters($p, $joinParams);

        $this->logger->info(
            'Meeting join request is going to redirect to the web client.',
            ['meetingID' => $meetingId]
        );

        $joinResponse = $bbbRequester->send(static fn () => $bbbRequester->joinMeeting($joinParams));

        if (null === $joinResponse) {
            $this->renderJson(['meeting' => 'Could not start or join the meeting'], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

            return;
        }

        $this->renderJson($joinResponse->getUrl());
    }

    /**
     * Build the public room URL. The Origin header points at whatever client sent the
     * request, which is the development server or nothing at all, so the configured
     * public URL comes first and the request host is the fallback.
     */
    private function roomUrl(string $link): string
    {
        $base = mb_rtrim((string) $this->f3->get('client.url'), '/');

        if ('' === $base) {
            $host = (string) $this->f3->get('HOST');
            $port = (int) $this->f3->get('PORT');
            $base = $this->f3->get('SCHEME') . '://' . $host;
            if (0 !== $port && 80 !== $port && 443 !== $port) {
                $base .= ':' . $port;
            }
        }

        return $base . $this->f3->get('client.room_url_prefix') . $link;
    }

    private function attachPresentations(CreateMeetingParameters $createParams, Room $room): void
    {
        $presentations = $room->getPresentations();
        if (empty($presentations)) {
            return;
        }

        $uploadsDir = realpath($this->f3->get('UPLOADS'));
        if (false === $uploadsDir) {
            $this->logger->warning('Uploads directory could not be resolved, presentations skipped', ['room_id' => $room->id]);

            return;
        }

        // BBB rejects create requests whose POST body exceeds ~2 MB, so we
        // embed the files as base64 but skip anything that would exceed that.
        $embeddedBytes = 0;
        foreach ($presentations as $entry) {
            $info     = Room::normalizePresentation($entry);
            $name     = $info['name'];
            $filePath = mb_rtrim($uploadsDir, '/\\') . '/' . $name;
            if (!is_file($filePath)) {
                $this->logger->warning('Presentation file not found, skipped', ['room_id' => $room->id, 'name' => $name]);

                continue;
            }

            $size = filesize($filePath);
            if (false === $size || $size + $embeddedBytes > self::PRE_UPLOAD_MAX_BYTES) {
                $this->logger->warning('Presentation file too large to pre-upload, skipped', ['room_id' => $room->id, 'name' => $name, 'size' => $size, 'limit' => self::PRE_UPLOAD_MAX_BYTES]);

                continue;
            }

            $content = file_get_contents($filePath);
            if (false === $content || '' === $content) {
                $this->logger->warning('Presentation file could not be read, skipped', ['room_id' => $room->id, 'name' => $name]);

                continue;
            }

            $createParams->addPresentation($name, $content, $name, new DocumentOptionsStore());
            $embeddedBytes += $size;
            $this->logger->info('Presentation pre-uploaded to meeting', ['room_id' => $room->id, 'name' => $name]);
        }
    }
}
