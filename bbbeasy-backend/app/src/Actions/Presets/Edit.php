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

namespace Actions\Presets;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Preset;
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
        $body        = $this->getDecodedBody();
        $form        = $body['data'];
        $id          = $params['id'];
        $dataChecker = new DataChecker();

        $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));
        $dataChecker->verify($id, Validator::notEmpty()->setName('id'));

        $errorMessage = 'Preset could not be updated';

        $preset = new Preset();
        $preset = $preset->findById($id);
        if ($preset->valid()) {
            if ($dataChecker->allValid()) {
                $checkPreset  = new Preset();
                $preset->name = $form['name'];
                if ($checkPreset->nameExists($preset->name, $preset->user_id, $preset->id)) {
                    $this->logger->error($errorMessage, ['error' => 'Name already exists']);
                    $this->renderJson(['errors' => ['name' => 'Name already exists']], ResponseCode::HTTP_PRECONDITION_FAILED);
                } else {
                    try {
                        $preset->save();
                    } catch (\Exception $e) {
                        $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
                        $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        return;
                    }
                    $this->logger->info('preset successfully updated', ['preset' => $preset->toArray()]);
                    $this->renderJson(['result' => 'success', 'preset' => $preset->getMyPresetInfos($preset)]);
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
