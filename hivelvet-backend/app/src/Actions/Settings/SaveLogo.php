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
use Base;
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
     * @param Base  $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        /**
         * @todo for future tasks
         * if ($f3->get('system.installed') === false) {
         */
        $form        = $f3->get('POST');
        $dataChecker = new DataChecker();
        // if files not empty
        $dataChecker->verify($form['logo_name'], Validator::notEmpty()->setName('logo_name'));

        if ($dataChecker->allValid()) {
            // verif format file
            $format         = $f3->get("FILES")["logo"]["type"];
            $validFormats   = ["image/jpg", "image/jpeg", "image/png"];
            if(in_array($format,$validFormats)) {
                // correct
                \Web::instance()->receive();
                $setting        = new Setting();
                $settings       = $setting->find([], ['limit' => 1])->current();
                $settings->logo = $form['logo_name'];

                try {
                    $settings->save();
                    $this->logger->info('Initial application setup : Update settings logo', ['setting' => $settings->toArray()]);
                } catch (\Exception $e) {
                    $message = $e->getMessage();
                    $this->logger->info('Initial application setup : Logo could not be updated', ['error' => $message]);
                    $this->renderJson(['errors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
                }
            }
            else {
                $this->logger->error('Initial application setup : Logo could not be updated', ['error' => 'invalid file format : '. $format]);
            }
        }
    }
}
