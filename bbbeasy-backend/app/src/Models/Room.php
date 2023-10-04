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

namespace Models;

use BigBlueButton\Core\Record;
use BigBlueButton\Parameters\GetRecordingsParameters;
use Enum\ResponseCode;
use Models\Base as BaseModel;
use Utils\BigBlueButtonRequester;

/**
 * Class Room.
 *
 * @property int       $id
 * @property string    $name
 * @property string    $meeting_id
 * @property string    $short_link
 * @property int       $preset_id
 * @property int       $user_id
 * @property Label[]   $labels
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 */
class Room extends BaseModel
{
    protected $fieldConf = [
        'preset_id' => [
            'belongs-to-one' => Preset::class,
        ],
    ];

    protected $table = 'rooms';

    public function nameExists($name, $userId, $id = null)
    {
        return $this->load(['lower(name) = ? and user_id = ? and id != ?', mb_strtolower($name), $userId, $id]);
    }

    public function getByNameAndLink($name, $link): self
    {
        $this->load(['name = ? and short_link = ?', $name, $link]);

        return $this;
    }

    public function meetingIdExists($meetingId)
    {
        return $this->load(['meeting_id = ?', $meetingId]);
    }

    public function shortlinkExists($shortlink, $id = null)
    {
        return $this->load(['short_link = ? and id != ?', $shortlink, $id]);
    }

    public function presetExists($presetId, $name)
    {
        return $this->load(['preset_id = ? and name = ?', $presetId, $name]);
    }

    /**
     * Get room record by link.
     *
     * @param mixed $link
     *
     * @return $this
     */
    public function getByLink($link): self
    {
        $this->load(['short_link = ?', $link]);

        return $this;
    }

    /**
     * Get room record by id value.
     *
     * @param mixed $id
     *
     * @return $this
     */
    public function getById($id): self
    {
        $this->load(['id = ?', $id]);

        return $this;
    }

    public function collectAllByUserId($userId): array
    {
        return $this->db->exec('SELECT id, name, short_link, preset_id, user_id FROM rooms where user_id =?', $userId);
    }

    public function collectAllByPresetId($presetId): array
    {
        return $this->db->exec('SELECT id, name, short_link, preset_id ,user_id FROM rooms where preset_id =?', $presetId);
    }

    public function collectAll(): array
    {
        $data  = [];
        $rooms = $this->find([], ['order' => 'id']);
        if ($rooms) {
            foreach ($rooms as $room) {
                $data[] = $room->getRoomInfos($room);
            }
        }

        return $data;
    }

    public function getRoomInfos(): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'preset_id'  => $this->getPresetID($this->id)['preset_id'],
            'user_id'    => $this->getUserID($this->id)['user_id'],
            'short_link' => $this->short_link,
            'labels'     => $this->getLabels($this->id),
        ];
    }

    public function getPresetID($id)
    {
        if ($id) {
            $subQuery = 'WHERE r.id = :room_id';
            $params   = [':room_id' => $id];
        }
        $result = $this->db->exec(
            'SELECT
                 p.id AS preset_id
            FROM
                rooms r
            LEFT JOIN presets p ON r.preset_id = p.id ' . $subQuery,
            $params
        );

        return $id ? $result[0] : $result;
    }

    public function getUserID($id)
    {
        if ($id) {
            $subQuery = 'WHERE r.id = :room_id';
            $params   = [':room_id' => $id];
        }
        $result = $this->db->exec(
            'SELECT
                 u.id AS user_id
            FROM
                rooms r
            LEFT JOIN users u ON r.user_id = u.id ' . $subQuery,
            $params
        );

        return $id ? $result[0] : $result;
    }

    public function getLabels($room): array
    {
        $roomlabel = new RoomLabel();

        $roomlabels = $roomlabel->collectAllByRoomId($room);

        $lbs = [];
        if ($roomlabels) {
            foreach ($roomlabels as $rl) {
                $label = new Label();

                $labels = $label->getById($rl['label_id']);
                if ($labels) {
                    $lbs[] = $labels->getLabelInfos($labels);
                }
            }
        }

        return $lbs;
    }

    public function getRecordingsByRoomMeetingId(string $meetingId): ?array
    {
        $bbbRequester     = new BigBlueButtonRequester();
        $recordingsParams = new GetRecordingsParameters();
        $recordingsParams->setMeetingId($meetingId);
        $this->logger->info('Received request to fetch recordings', ['meetingID' => $meetingId]);

        $recordingsResponse = $bbbRequester->getRecordings($recordingsParams);

        if ($recordingsResponse->success() && \count($recordingsResponse->getRecords()) > 0) {
            $recordingsData = [];
            $recordings     = $recordingsResponse->getRawXml()->recordings;
            $recordings     = $recordings[0];

            foreach ($recordings as $recording) {
                $bbbRecord = new Record($recording);

                $recordingsData[] = $this->getRecordingInfo($bbbRecord, (array) $recording->participants);
            }

            return $recordingsData;
        }

        return null;
    }

    public function getRecordingByRecordId(string $recordId, bool $loadRecord = false): bool|array|null
    {
        $bbbRequester    = new BigBlueButtonRequester();
        $recordingParams = new GetRecordingsParameters();
        $recordingParams->setRecordId($recordId);
        $this->logger->info('Received request to fetch recording', ['recordID' => $recordingParams]);

        $recordingResponse = $bbbRequester->getRecordings($recordingParams);
        if ($recordingResponse->success() && \count($recordingResponse->getRecords()) > 0) {
            if (true === $loadRecord) {
                $recording = $recordingResponse->getRawXml()->recordings->recording[0];
                $bbbRecord = $recordingResponse->getRecords()[0];

                return $this->getRecordingInfo($bbbRecord, (array) $recording->participants);
            }

            return true;
        }

        return null;
    }

    public function getRecordingInfo(Record $record, array $attendees): array
    {
        $recordingId = $record->getRecordId();

        if (\array_key_exists('name', $record->getMetas())) {
            $recordingName = $record->getMetas()['name'];
        } else {
            $recordingName = $record->getName();
        }
        $recordingState   = $record->getState();
        $recordingFormats = [];
        if (null !== $record->getPlaybackType()) {
            $recordingFormats[] = $record->getPlaybackType();
        }
        $recordingUrl          = trim($record->getPlaybackUrl());
        $participants          = $attendees;
        $recordingParticipants = null !== $participants ? (int) $participants[0] : 0;
        // convert milliseconds to timestamp
        $startTime = (int) ceil(((int) $record->getStartTime()) / 1000);
        $endTime   = (int) ceil(((int) $record->getEndTime()) / 1000);

        $recordingDate = date('d/m/Y', $startTime);

        $startDateTime = new \DateTime();
        $startDateTime->setTimestamp($startTime);
        $endDateTime = new \DateTime();
        $endDateTime->setTimestamp($endTime);
        $recordingDuration = $startDateTime->diff($endDateTime)->format('%H:%I:%S');

        return [
            'key'      => $recordingId,
            'name'     => $recordingName,
            'date'     => $recordingDate,
            'duration' => $recordingDuration,
            'users'    => $recordingParticipants,
            'state'    => $recordingState,
            'formats'  => $recordingFormats,
            'url'      => $recordingUrl,
        ];
    }

    /**
     * Delete a room if it's allowed and  removing its associated roomlabels.
     *
     * @return Array[2](Array[], ResponsCode)
     */
    public function delete(): array
    {
        // delete associated roomslabels
        $label  = new Label();
        $result = $label->deleteRoomsLabels($this->id);

        if ($result) {
            try {
                $this->erase();
                $this->logger->info('Room successfully deleted', ['room' => $this->toArray()]);
            } catch (\Exception $e) {
                $this->logger->error('room could not be deleted', ['room' => $this->toArray(), 'error' => $e->getMessage()]);

                throw $e;
            }

            return [['result' => 'success'], ResponseCode::HTTP_OK];
        }

        return [[], ResponseCode::HTTP_FORBIDDEN];
    }
}
