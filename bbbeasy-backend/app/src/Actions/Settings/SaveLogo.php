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

namespace Actions\Settings;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Respect\Validation\Validator;
use Utils\DataUtils;
use Validation\DataChecker;

/**
 * Class SaveLogo.
 */
class SaveLogo extends BaseAction
{
    /**
     * @param mixed $f3
     * @param mixed $params
     *
     * @throws \JsonException
     */
    public function execute($f3, $params): void
    {
        /**
         * @todo for future tasks
         * if ($f3->get('system.installed') === false) {
         */
        $form        = $f3->get('POST');
        $dataChecker = new DataChecker();
        $dataChecker->verify($form['logo_name'], Validator::notEmpty()->setName('logo_name'));
        $errorMessage = 'File could not be saved';

        if (!$dataChecker->allValid()) {
            $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        } else {
            $format       = $f3->get('FILES')['logo']['type'];
            $validFormats = ['image/jpg', 'image/jpeg', 'image/png'];
            if (DataUtils::validateImageFormat($format, $validFormats)) {
                // correct
                \Web::instance()->receive();
            } else {
                $this->logger->error($errorMessage, ['error' => 'invalid file format : ' . $format]);
                $this->renderJson(['message' => 'invalid file format'], ResponseCode::HTTP_PRECONDITION_FAILED);
            }
        }
    }
}
