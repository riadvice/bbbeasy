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
use Enum\ResponseCode;
use Enum\UserRole;
use Enum\UserStatus;
use Models\PresetSetting;
use Models\Role;
use Models\Setting;
use Models\User;
use Respect\Validation\Validator;
use Utils\PrivilegeUtils;
use Validation\DataChecker;

class Install extends BaseAction
{
    /**
     * @param $f3
     * @param $params
     *
     * @throws \JsonException
     */
    public function execute($f3, $params): void
    {
        /**
         * @todo for future tasks
         * if ($f3->get('system.installed') === false) {
         */
        $body        = $this->getDecodedBody();
        $form        = $body['data'];
        $dataChecker = new DataChecker();

        $dataChecker->verify($form['username'], Validator::length(4)->setName('username'));
        $dataChecker->verify($form['email'], Validator::email()->setName('email'));
        $dataChecker->verify($form['password'], Validator::length(4)->setName('password'));

        $dataChecker->verify($form['company_name'], Validator::notEmpty()->setName('company_name'));
        $dataChecker->verify($form['company_url'], Validator::url()->setName('company_url'));
        $dataChecker->verify($form['platform_name'], Validator::notEmpty()->setName('platform_name'));

        if ('' !== $form['term_url']) {
            $dataChecker->verify($form['term_url'], Validator::url()->setName('term_url'));
        }
        if ('' !== $form['policy_url']) {
            $dataChecker->verify($form['policy_url'], Validator::url()->setName('policy_url'));
        }

        if (!$dataChecker->allValid()) {
            $this->logger->error('Initial application setup', ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        } else {
            $user           = new User();
            $user->email    = $form['email'];
            $user->username = $form['username'];
            $user->password = $form['password'];
            $user->status   = UserStatus::ACTIVE;

            try {
                $user->save();
                $this->logger->info('Initial application setup : Add administrator', ['user' => $user->toArray()]);

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
                    $defaultSettings->save();
                    $this->logger->info('Initial application setup : Update settings', ['settings' => $defaultSettings->toArray()]);

                    // add configured presets
                    $presets = $form['presetsConfig'];
                    if ($presets) {
                        foreach ($presets as $preset) {
                            $subcategories = $preset['subcategories'];
                            foreach ($subcategories as $subcategory) {
                                $presetSettings          = new PresetSetting();
                                $presetSettings->group   = $preset['name'];
                                $presetSettings->name    = $subcategory['name'];
                                $presetSettings->enabled = $subcategory['enabled'];

                                try {
                                    $presetSettings->save();
                                    $this->logger->info('Initial application setup : Add preset settings', ['preset' => $presetSettings->toArray()]);
                                } catch (\Exception $e) {
                                    $message = $e->getMessage();
                                    $this->logger->error('Initial application setup : Preset settings could not be added', ['error' => $message]);
                                    $this->renderJson(['errors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                                    return;
                                }
                            }
                        }
                    }

                    // load admin role to allow privileges and assign it to admin user
                    $roleAdmin = new Role();
                    $roleAdmin->load(['id = ?', [UserRole::ADMINISTRATOR_ID]]);
                    if ($roleAdmin->valid()) {
                        // allow all privileges to admin role
                        $allPrivileges = PrivilegeUtils::listSystemPrivileges();
                        $result        = $roleAdmin->saveRoleAndPermissions($allPrivileges);
                        if ($result) {
                            $this->logger->info('Initial application setup : Allow all privileges to administrator role');
                            // assign admin created to role admin
                            $user->role_id = $roleAdmin->id;

                            try {
                                $user->save();
                                $this->logger->info('Initial application setup : Assign role to administrator user', ['user' => $user->toArray()]);
                            } catch (\Exception $e) {
                                $this->logger->error('Initial application setup : Role could not be assigned', ['error' => $e->getMessage()]);
                            }
                        }
                    }

                    $this->logger->info('Initial application setup has been successfully done');
                    $this->renderJson(['result' => 'success']);
                } catch (\Exception $e) {
                    $message = $e->getMessage();
                    $this->logger->error('Initial application setup : Settings could not be updated', ['error' => $message]);
                    $this->renderJson(['errors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
                }
            } catch (\Exception $e) {
                $message = $e->getMessage();
                $this->logger->error('Initial application setup : Administrator could not be added', ['error' => $message]);
                $this->renderJson(['errors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }
        }
    }
}
