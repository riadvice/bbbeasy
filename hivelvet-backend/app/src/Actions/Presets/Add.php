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

namespace Actions\Presets;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Base;
use Enum\ResponseCode;
use Models\Preset;
use Models\User;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Add.
 */
class Add extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param Base  $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body        = $this->getDecodedBody();
        $form        = $body['data'];
        $userId      = $body['user_id'];
        $dataChecker = new DataChecker();

        $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));
        $dataChecker->verify($userId, Validator::notEmpty()->setName('user_id'));

        $errorMessage   = 'Preset could not be added';
        $successMessage = 'Preset successfully added';
        if ($dataChecker->allValid()) {
            $user = new User();
            $user = $user->getById($userId);
            if (!$user->dry()) {
                $checkPreset  = new Preset();
                $preset       = new Preset();
                $preset->name = $form['name'];
                if ($checkPreset->nameExists($preset->name, $userId)) {
                    $this->logger->error($errorMessage, ['error' => 'Name already exists']);
                    $this->renderJson(['errors' => ['name' => 'Name already exists']], ResponseCode::HTTP_PRECONDITION_FAILED);
                } else {
                    $preset->user_id = $userId;
                    $result          = $preset->addDefaultSettings($successMessage, $errorMessage);
                    if ($result) {
                        $this->renderJson(['result' => 'success', 'preset' => $preset->getMyPresetInfos($preset)], ResponseCode::HTTP_CREATED);
                    } else {
                        $this->renderJson(['errors' => $result], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                    }
                }
            } else {
                $this->logger->error($errorMessage);
                $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
            }
        } else {
            $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
