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

namespace Actions\RoomPresentations;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Label;
use Models\Preset;
use Models\Room;
use Models\RoomLabel;
use Models\RoomPresentations;
use Models\User;
use Respect\Validation\Validator;
use Utils\DataUtils;
use Validation\DataChecker;

/**
 * Class Add.
 */
class Add extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param mixed $f3
     * @param mixed $params
     *
     * @throws \JsonException
     */
    public function save($f3, $params): void
    {
        $body = $this->getDecodedBody();

        $form = $body['data'];
        $room_id = $body['room_id'];
        $filename = $body['url_file'];
        //dumpe($filename);
        $dataChecker = new DataChecker();
        $userId      = $body['user_id'];
        $dataChecker->verify($room_id, Validator::notEmpty()->setName('room_id'));
        $dataChecker->verify($filename, Validator::notEmpty()->setName('file_name'));

        $errorMessage = 'Room presentation could not be added';
        if ($dataChecker->allValid()) {
            $checkRoom        = new Room();
            $roomPresentation             = new RoomPresentations();
            /*
               *
               $avatar = strtolower($avatar);
              $avatar = preg_replace('/[^a-z0-9 .-]+/', '', $avatar);
              $avatar = str_replace(' ', '-', $avatar);
              $user->avatar   = trim($avatar, '-');;
               */
            /*$presentation= strtolower($filename);
            $presentation= preg_replace('/[^a-z0-9 .-]+/', '', $presentation);
            $presentation= str_replace(' ', '-', $presentation);
            dumpe(trim($presentation, '-'));

            $roomPresentation->file_name  = trim($presentation, '-');
            */
            $roomPresentation->file_name  = $filename;
            $roomPresentation->room_id    = $room_id;
            try {
                $roomPresentation->save();
            } catch (\Exception $e) {
                $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
                $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                return;
            }
            $this->renderJson(['result' => 'success'], ResponseCode::HTTP_CREATED);

        } else {
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
