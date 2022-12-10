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

namespace Actions\Settings;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Models\Setting;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class SaveLogo.
 */
class SaveLogo extends BaseAction
{
    /**
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
            if (\in_array($format, $validFormats, true)) {
                // correct
                \Web::instance()->receive();
                $setting = new Setting();

                /** @var Setting $settings */
                $settings = $setting->find([], ['limit' => 1])->current();
                if (!$settings->dry()) {
                    $settings->logo = $form['logo_name'];

                    try {
                        $settings->save();
                        $this->logger->info('Initial application setup : Update settings logo', ['setting' => $settings->toArray()]);
                    } catch (\Exception $e) {
                        $message = $e->getMessage();
                        $this->logger->error($errorMessage, ['error' => $message]);
                        $this->renderJson(['errors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        return;
                    }
                }
            } else {
                $this->logger->error($errorMessage, ['error' => 'invalid file format : ' . $format]);
                $this->renderJson(['message' => 'invalid file format'], ResponseCode::HTTP_PRECONDITION_FAILED);
            }
        }
    }
}
