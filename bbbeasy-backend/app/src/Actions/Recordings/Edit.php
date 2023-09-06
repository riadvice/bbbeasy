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
use BigBlueButton\Parameters\DeleteRecordingsParameters;
use BigBlueButton\Parameters\PublishRecordingsParameters;
use BigBlueButton\Parameters\UpdateRecordingsParameters;
use Enum\ResponseCode;
use Models\Room;
use Respect\Validation\Validator;
use Utils\BigBlueButtonRequester;
use Validation\DataChecker;

/**
 * Class Edit.
 */
class Edit extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $recordId = $params['id'];

        $body        = $this->getDecodedBody();
        $form        = $body['data'];
        $dataChecker = new DataChecker();
        $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));
        $errorMessage = 'Recording could not be updated';
        $room         = new Room();
        if ($room->getRecordingByRecordId($recordId)) {
            if ($dataChecker->allValid()) {
                $recording = $room->getRecordingByRecordId($recordId, true);

                $bbbRequester = new BigBlueButtonRequester();
                $editParams   = new UpdateRecordingsParameters($recordId);

                $recordName = $form['name'];

                $recordState = $form['state'];

                if ($recordName !== $recording['name']) {
                    $editParams->addMeta('name', $recordName);
                    $this->logger->info('Received request to edit recording', ['recordID' => $recordId]);
                    $editResponse = $bbbRequester->updateRecordings($editParams);
                    if ($editResponse->success() && $editResponse->isUpdated()) {
                        $this->logger->info('Recording name successfully updated', ['recordID' => $recordId]);
                        $newRecording = $room->getRecordingByRecordId($recordId, true);
                        $this->renderJson(['result' => 'success', 'recording' => $newRecording]);
                    } else {
                        $this->logger->error('Recording could not be updated', ['recordID' => $recordId, 'error' => $editResponse->getMessage()]);
                        $this->renderJson([], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                    }
                }

                if (null !== $recordState && $recordState !== $recording['state']) {
                    $publish = 'published' === $form['state'] ? true : ('unpublished' === $form['state'] ? false : null);

                    if ('published' === $form['state'] || 'unpublished' === $form['state']) {
                        $publish = 'published' === $form['state'] ? true : false;

                        $publishParams   = new PublishRecordingsParameters($recordId, $publish);
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
                        $deleteParams   = new DeleteRecordingsParameters($recordId);
                        $deleteResponse = $bbbRequester->deleteRecordings($deleteParams);
                        if ($deleteResponse->success() && $deleteResponse->isDeleted()) {
                            $this->logger->info('Recording  successfully deleted', ['recordID' => $recordId]);
                            $newRecording = $room->getRecordingByRecordId($recordId, true);
                            $this->renderJson(['result' => 'success', 'recording' => $newRecording]);
                        } else {
                            $this->logger->error('Recording  could not be deleted', ['recordID' => $recordId, 'error' => $deleteResponse->getMessage()]);
                            $this->renderJson([], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                        }
                    }
                }
            } else {
                $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
                $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
            }
        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
