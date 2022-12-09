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

        $errorMessage        = 'Label could not be added';
        $name_error_message  = 'Label name already exists';
        $color_error_message = 'Label color already exists';

        $dataChecker = new DataChecker();
        $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));
        $dataChecker->verify($form['color'], Validator::hexRgbColor()->setName('color'));

        if ($dataChecker->allValid()) {
            $label      = new Label();
            $nameExist  = $label->nameExists($form['name']);
            $colorExist = $label->colorExists($form['color']);
            if ($nameExist || $colorExist) {
                if ($nameExist && $colorExist) {
                    $message = ['name' => $name_error_message, 'color' => $color_error_message];
                } elseif ($nameExist) {
                    $message = ['name' => $name_error_message];
                } else {
                    $message = ['color' => $color_error_message];
                }

                $this->logger->error($errorMessage, ['errors' => $message]);
                $this->renderJson(['errors' => $message], ResponseCode::HTTP_PRECONDITION_FAILED);

                return;
            }

            $label->name        = $form['name'];
            $label->description = $form['description'];
            $label->color       = $form['color'];

            try {
                $label->save();
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
