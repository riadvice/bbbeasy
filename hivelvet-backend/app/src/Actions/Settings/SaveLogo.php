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
use Validation\Validator;

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
        $files = $f3->get('FILES');
        $form  = $f3->get('POST');
        $v     = new Validator();

        $v->notEmpty()->verify('logo_name', $form['logo_name']);
        //if files not empty

        if ($v->allValid()) {
            $this->logger->info('App configuration saving logo', ['FILES' => $files]);
            // verif format file

            //correct
            \Web::instance()->receive();
            $setting        = new Setting();
            $settings       = $setting->find([], ['limit' => 1])->current();
            $settings->logo = $form['logo_name'];

            try {
                //$settings->save();
                $this->logger->info('App configuration saving logo', ['setting' => $settings->toArray()]);
            } catch (\Exception $e) {
                $message = $e->getMessage();
                $this->logger->error('logo could not be updated', ['error' => $message]);
                $this->renderJson(['errors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }
        }
        //}
    }
}
