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
use Utils\DataUtils;
use Utils\PrivilegeUtils;
use Validation\DataChecker;

class Install extends BaseAction
{
    /**
     * @param mixed $f3
     * @param mixed $params
     *
     * @throws \JsonException
     */
    public function execute($f3, $params): void
    {
        $checkUser = new User();
        if (!$checkUser->adminUserExists()) {
            $body = $this->getDecodedBody();
            $form = $body['data'];

            if (null !== $form) {
                $setting     = new Setting();
                $dataChecker = new DataChecker();

                $dataChecker = $setting->checkSettingsData($dataChecker, $form);
                $dataChecker->verify($form['presetsConfig'], Validator::notEmpty()->setName('presetsConfig'));

                if (!$dataChecker->allValid()) {
                    $this->logger->error('Initial application setup', ['errors' => $dataChecker->getErrors()]);
                    $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
                } else {
                    if (null !== $form['logo']) {
                        $logoName = $form['logo'];
                        if (!DataUtils::validateImageFormat($logoName)) {
                            $this->logger->error('Settings could not be updated', ['errors' => 'invalid file format : ' . $logoFormat]);

                            $this->renderJson(['message' => 'invalid file format'], ResponseCode::HTTP_PRECONDITION_FAILED);

                            return;
                        }
                    }

                    // load admin role to allow privileges and assign it to admin user
                    $roleAdmin = new Role();
                    $roleAdmin->load(['id = ?', [UserRole::ADMINISTRATOR_ID]]);

                    if ($roleAdmin->valid()) {
                        // allow all privileges to admin role
                        $allPrivileges = PrivilegeUtils::listSystemPrivileges();
                        $result        = $roleAdmin->saveRoleAndPermissions($roleAdmin->name, $allPrivileges);
                        if ($result) {
                            $this->logger->info('Initial application setup : Allow all privileges to administrator role');

                            // add admin and assign admin created to role admin
                            $user           = new User();
                            $user->email    = $form['email'];
                            $user->username = $form['username'];
                            $user->password = $form['password'];
                            $user->status   = UserStatus::ACTIVE;
                            $user->role_id  = $roleAdmin->id;

                            // @fixme: should not have embedded try/catch here

                            $errorMessage = 'Administrator could not be added';
                            if ($this->credentialsAreValid($user->username, $user->email, $form['password'], $errorMessage)) {
                                $user->save();

                                $userId = $user->getByEmail($form['email'])->id;

                                $this->logger->info('Initial application setup : Add administrator with admin role and default preset', ['user' => $user->toArray()]);

                                /** @var Setting $settings */
                                $settings = $setting->find([], ['limit' => 1])->current();
                                if (!$settings->dry()) {
                                    $settings->saveSettings(
                                        $form['company_name'],
                                        $form['company_url'],
                                        $form['platform_name'],
                                        $form['term_url'],
                                        $form['policy_url'],
                                        $form['logo'],
                                        $form['theme'],
                                        false,
                                        false
                                    );

                                    // @fixme: should not have embedded try/catch here

                                    $settings->save();
                                    $this->logger->info('Initial application setup : Update settings', ['settings' => $settings->toArray()]);

                                    // add configured presets
                                    $presets = $form['presetsConfig'];

                                    if ($presets) {
                                        $presetSettings = new PresetSetting();
                                        $result         = $presetSettings->savePresetSettings($presets);

                                        if (\is_string($result)) {
                                            $this->renderJson(['errors' => $result], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                                        }
                                    }

                                    $user->saveDefaultPreset($userId);

                                    $this->logger->info('Initial application setup has been successfully done');
                                    $this->renderJson(['result' => 'success']);
                                }
                            }
                        }
                    }
                }
            }
        } else {
            //  already installed
            $this->logger->error('Initial application setup', ['error' => 'application already installed']);
            $this->renderJson(['locked' => true], ResponseCode::HTTP_LOCKED);
        }
    }
}
