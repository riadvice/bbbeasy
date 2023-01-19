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
use Enum\ResponseCode;
use Models\Room;
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
        $body = $this->getDecodedBody();
        $form = $body['data'];

        $id          = $params['id'];
        $dataChecker = new DataChecker();

        $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));
        $dataChecker->verify($id, Validator::notEmpty()->setName('id'));

        $errorMessage = 'Room could not be updated';

        $room = new Room();
        $room = $room->getById($id);
        if ($room->valid()) {
            if ($dataChecker->allValid()) {
                $checkRoom  = new Room();
                $room->name = $form['name'];

                if ($checkRoom->nameExists($room->name, $room->user_id, $room->id)) {
                    $this->logger->error($errorMessage, ['error' => 'Name already exists']);
                    $this->renderJson(['errors' => ['name' => 'Name already exists']], ResponseCode::HTTP_PRECONDITION_FAILED);
                } else {
                    try {
                        $room->save();
                    } catch (\Exception $e) {
                        $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
                        $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        return;
                    }
                    $this->logger->info('room successfully updated', ['room' => $room->toArray()]);
                    $this->renderJson(['result' => 'success', 'room' => $room->getRoomInfos()]);
                }
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
