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

namespace Actions\Labels;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Label;
use Respect\Validation\Validator;
use Validation\DataChecker;

class Add extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body = $this->getDecodedBody();
        $form = $body['data'];

        $errorMessage      = 'Label could not be added';
        $nameErrorMessage  = 'Label name already exists';
        $colorErrorMessage = 'Label color already exists';

        $dataChecker = new DataChecker();
        $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));
        $dataChecker->verify($form['name'], Validator::length(1, 32)->setName('name'));
        $dataChecker->verify($form['color'], Validator::notEmpty()->setName('color'));

        if ($dataChecker->allValid()) {
            $label      = new Label();
            $colorExist = $label->colorExists($form['color']);

            if ($colorExist) {
                $message = ['color' => $colorErrorMessage];

                $this->logger->error($errorMessage, ['errors' => $message]);
                $this->renderJson(['errors' => $message], ResponseCode::HTTP_PRECONDITION_FAILED);

                return;
            }

            $label->name        = $form['name'];
            $label->description = $form['description'];
            $label->color       = $form['color'];

            try {
                $label->save();
                $label = $label->getById($label->lastInsertId());
            } catch (\Exception $e) {
                $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
                $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }
            $this->renderJson(['result' => 'success', 'label' => $label->getLabelInfos()], ResponseCode::HTTP_CREATED);
        } else {
            $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
