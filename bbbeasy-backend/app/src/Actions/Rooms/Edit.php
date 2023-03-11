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
use Enum\ResponseCode;
use Models\Label;
use Models\Room;
use Models\RoomLabel;
use Respect\Validation\Validator;
use Validation\DataChecker;

class Edit extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function rename($f3, $params): void
    {
        $body         = $this->getDecodedBody();
        $form         = $body['data'];
        $errorMessage = 'Room could not be updated';

        $id   = $params['id'];
        $room = new Room();
        $room = $room->getById($id);
        if ($room->valid()) {
            $dataChecker = new DataChecker();

            $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));
            $dataChecker->verify($form['short_link'], Validator::notEmpty()->setName('short_link'));
            $dataChecker->verify($form['preset_id'], Validator::notEmpty()->setName('preset_id'));

            $nameErrorMessage      = 'Room name already exists';
            $shortlinkErrorMessage = 'Room link already exists';

            if ($dataChecker->allValid()) {
                $checkRoom        = new Room();
                $room->name       = $form['name'];
                $room->short_link = $form['short_link'];

                $room->preset_id = $form['preset_id'];
                $nameExist       = $checkRoom->nameExists($room->name, $room->user_id, $id);
                $shortlinkExist  = $checkRoom->shortlinkExists($room->short_link, $id);

                if ($nameExist || $shortlinkExist) {
                    if ($nameExist && $shortlinkExist) {
                        $message = ['name' => $nameErrorMessage, 'shortlink' => $shortlinkErrorMessage];
                    } elseif ($nameExist) {
                        $message = ['name' => $nameErrorMessage];
                    } else {
                        $message = ['short_link' => $shortlinkErrorMessage];
                    }
                    $this->logger->error($errorMessage, ['errors' => $message]);
                    $this->renderJson(['errors' => $message], ResponseCode::HTTP_PRECONDITION_FAILED);

                    return;
                }

                if ($form['labels']) {
                    foreach ($form['labels'] as $label) {
                        // test if element has been added to room labels list
                        $l = new Label();
                        $l = $l->getByColor($label);

                        if (!$l->dry()) {
                            $room_label = new RoomLabel();

                            if (!$room_label->roomAndLabelExists($room->id, $l->id)) {
                                $room_label->label_id = $l->id;
                                $room_label->room_id  = $room->id;

                                $room_label->save();
                            }
                        }
                    }
                }

                foreach ($room->getLabels($room->id) as $label) {
                    $roomLabel = new RoomLabel();

                    if (!\in_array($label['color'], $form['labels'], true)) {
                        $roomLabel = $roomLabel->getByRoomAndLabel($room->id, $label['key']);
                        if (!$roomLabel->dry()) {
                            $roomLabel->erase();
                        }
                    }
                }

                try {
                    $room->save();
                } catch (\Exception $e) {
                    $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
                    $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
                }

                $this->logger->info('room successfully updated', ['room' => $room->toArray()]);
                $this->renderJson(['result' => 'success', 'room' => $room->getRoomInfos()]);
            } else {
                $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
                $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
            }
        } else {
            $this->logger->error($errorMessage);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
