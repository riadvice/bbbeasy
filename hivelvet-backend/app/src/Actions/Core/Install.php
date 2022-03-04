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

namespace Actions\Core;

use Actions\Base as BaseAction;
use Base;
use Enum\ResponseCode;
use Enum\UserRole;
use Enum\UserStatus;
use Models\Setting;
use Models\User;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Install.
 */
class Install extends BaseAction
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
        $body           = $this->getDecodedBody();
        $form           = $body['data'];
        $dataChecker    = new DataChecker();

        $dataChecker->verify($form['username'], Validator::length(4)->setName('username'));
        $dataChecker->verify($form['email'], Validator::email()->setName('email'));
        $dataChecker->verify($form['password'], Validator::length(4)->setName('password'));

        $dataChecker->verify($form['company_url'], Validator::url()->setName('company_url'));
        $dataChecker->verify($form['term_url'], Validator::url()->setName('term_url'));
        $dataChecker->verify($form['policy_url'], Validator::url()->setName('policy_url'));

        if (!$dataChecker->allValid()) {
            $this->logger->error('App configuration', ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        } else {
            $user           = new User();
            $user->email    = $form['email'];
            $user->username = $form['username'];
            $user->role     = UserRole::ADMIN;
            $user->status   = UserStatus::ACTIVE;

            try {
                //$user->save();
                $this->logger->info('App configuration', ['user' => $user->toArray()]);

                $setting         = new Setting();
                $defaultSettings = $setting->find([], ['limit' => 1])->current();

                $defaultSettings->company_name    = $form['company_name'];
                $defaultSettings->company_website = $form['company_url'];
                $defaultSettings->platform_name   = $form['platform_name'];
                if ('' !== $form['term_url']) {
                    $defaultSettings->terms_use = $form['term_url'];
                }
                if ('' !== $form['policy_url']) {
                    $defaultSettings->privacy_policy = $form['policy_url'];
                }
                $colors                            = $form['branding_colors'];
                $defaultSettings->primary_color    = $colors['primary_color'];
                $defaultSettings->secondary_color  = $colors['secondary_color'];
                $defaultSettings->accent_color     = $colors['accent_color'];
                $defaultSettings->additional_color = $colors['add_color'];

                try {
                    //$defaultSettings->save();
                    $this->logger->info('App configuration', ['setting' => $defaultSettings->toArray()]);

                    $presets = $form['presetsConfig'];
                    /*
                    foreach ($presets as $preset) {
                        $subcategories = $preset['subcategories'];
                        foreach ($subcategories as $subcategory) {
                            $presetSettings                 = new PresetSetting();
                            $presetSettings->subcategory_id = $subcategory['id'];
                            $presetSettings->is_enabled     = $subcategory['status'];

                            try {
                                //$presetSettings->save();
                                $this->logger->info('App configuration', ['preset settings' => $presetSettings->toArray()]);
                            } catch (\Exception $e) {
                                $message = $e->getMessage();
                                $this->logger->error('preset settings could not be added', ['error' => $message]);
                                $this->renderJson(['presetsErrors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                                return;
                            }
                        }
                    }
                    */
                    //$this->logger->info('administrator and settings and presets successfully added', ['user' => $user->toArray()]);
                    $this->renderJson(['message' => 'Application installed !']);
                } catch (\Exception $e) {
                    $message = $e->getMessage();
                    $this->logger->error('settings could not be added', ['error' => $message]);
                    $this->renderJson(['settingsErrors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
                }
            } catch (\Exception $e) {
                $message = $e->getMessage();
                $this->logger->error('administrator could not be added', ['error' => $message]);
                $this->renderJson(['userErrors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }
        }
    }
}
