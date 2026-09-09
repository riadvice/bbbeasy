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
     * @param mixed $f3
     * @param mixed $params
     *
     * @throws \JsonException
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
            $dataChecker->verify($form['short_link'], Validator::notEmpty()->length(1, 255)->setName('short_link'));
            $dataChecker->verify($form['preset_id'], Validator::notEmpty()->setName('preset_id'));

            if ($dataChecker->allValid()) {
                $errors = $room->uniquenessErrors($form['name'], $form['short_link'], $room->user_id, $room->id);

                if ($errors) {
                    $this->logger->error($errorMessage, ['errors' => $errors]);
                    $this->renderJson(['errors' => $errors], ResponseCode::HTTP_PRECONDITION_FAILED);

                    return;
                }

                $room->name       = $form['name'];
                $room->short_link = $form['short_link'];
                $room->preset_id  = $form['preset_id'];

                $this->syncLabels($room, $form['labels'] ?? []);

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

    /**
     * Bring the room labels in line with the colours the form carries, adding what
     * is new and removing what is gone.
     */
    protected function syncLabels(Room $room, array $colors): void
    {
        foreach ($colors as $color) {
            $label = new Label()->getByColor($color);
            if ($label->dry()) {
                continue;
            }

            $roomLabel = new RoomLabel();
            if (!$roomLabel->roomAndLabelExists($room->id, $label->id)) {
                $roomLabel->label_id = $label->id;
                $roomLabel->room_id  = $room->id;
                $roomLabel->save();
            }
        }

        foreach ($room->getLabels($room->id) as $label) {
            if (\in_array($label['color'], $colors, true)) {
                continue;
            }

            $roomLabel = new RoomLabel()->getByRoomAndLabel($room->id, $label['key']);
            if (!$roomLabel->dry()) {
                $roomLabel->erase();
            }
        }
    }
}
