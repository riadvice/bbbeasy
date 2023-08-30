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
use Enum\ResponseCode;
use Models\Room;
use Utils\BigBlueButtonRequester;

/**
 * Class Delete.
 */
class Delete extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        $recordId = $params['id'];
        $room     = new Room();
        if ($room->getRecordingByRecordId($recordId)) {
            $bbbRequester = new BigBlueButtonRequester();
            $deleteParams = new DeleteRecordingsParameters($recordId);

            $this->logger->info('Received request to delete recordings', ['recordID' => $recordId]);
            $deleteResponse = $bbbRequester->deleteRecordings($deleteParams);
            if ($deleteResponse->success() && $deleteResponse->isDeleted()) {
                $this->logger->info('Recording successfully deleted', ['recordID' => $recordId]);
                $this->renderJson(['result' => 'success']);
            } else {
                $this->logger->error('Recording could not be deleted', ['recordID' => $recordId, 'error' => $deleteResponse->getMessage()]);
                $this->renderJson([], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
