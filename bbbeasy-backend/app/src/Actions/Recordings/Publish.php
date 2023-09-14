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
use BigBlueButton\Parameters\PublishRecordingsParameters;
use Enum\ResponseCode;
use Models\Room;
use Utils\BigBlueButtonRequester;

/**
 * Class Publish.
 */
class Publish extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        $recordId = $params['id'];

        $body    = $this->getDecodedBody();
        $publish = $body['data'];

        $room = new Room();
        if ($room->getRecordingByRecordId($recordId)) {
            $bbbRequester  = new BigBlueButtonRequester();
            $publishParams = new PublishRecordingsParameters($recordId, $publish);
            // $recordName   = $form['name'];
            // $recordState =$form['state'];

            // $editParams->addMeta('HVname', $recordName);
            $this->logger->info('Received request to publish recording', ['recordID' => $recordId]);
            $publishResponse = $bbbRequester->publishRecordings($publishParams);

            if ($publishResponse->success() && ($publish && $publishResponse->isPublished() || !$publish && !$publishResponse->isPublished())) {
                $this->logger->info('Recording state successfully updated', ['recordID' => $recordId]);
                $newRecording = $room->getRecordingByRecordId($recordId, true);
                $this->renderJson(['result' => 'success', 'recording' => $newRecording]);
            } else {
                $this->logger->error('Recording state could not be updated', ['recordID' => $recordId, 'error' => $publishResponse->getMessage()]);
                $this->renderJson([], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
