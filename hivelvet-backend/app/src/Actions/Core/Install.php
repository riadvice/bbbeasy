<?php
/**
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
use Models\PresetCategory;
use Models\PresetSetting;
use Models\PresetSubCategory;
use Models\Setting;
use Models\User;
use Validation\Validator;

/**
 * Class Install
 * @package Actions\Account
 */
class Install extends BaseAction
{

    /**
     * @param Base  $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        // @todo for future tasks
        //if ($f3->get('system.installed') === false) {
        $body   = $this->getDecodedBody();
        $form   = $body['data'];
        $v1      = new Validator();
        $v2      = new Validator();

        $step1Validated = false;
        $step2Validated = false;

        // step1 validation notEmpty
        $v1->notEmpty()->verify('username', $form['username'], ['notEmpty' => 'Username is required']);
        $v1->notEmpty()->verify('email', $form['email'], ['notEmpty' => 'Email is required']);
        $v1->notEmpty()->verify('password', $form['password'], ['notEmpty' => 'Password is required']);

        if ($v1->allValid()) {
            // step1 validation email/length
            $v1->email()->verify('email', $form['email'], ['email' => 'Email is invalid']);
            $v1->length(4)->verify('password', $form['password'], ['length' => 'Password must be at least 4 characters']);

            if ($v1->allValid()) {
                $step1Validated = true;
            }
        }

        // step2 validation notEmpty
        $v2->notEmpty()->verify('company_name', $form['company_name'], ['notEmpty' => 'Company name is required']);
        $v2->notEmpty()->verify('company_url', $form['company_url'], ['notEmpty' => 'Company website is required']);
        $v2->notEmpty()->verify('platform_name', $form['platform_name'], ['notEmpty' => 'Platform name is required']);

        if ($v2->allValid()) {
            //step2 validation url
            $v2->url()->verify('company_url', $form['company_url'], ['url' => 'Company website is not a valid url']);
            if ($v2->allValid()) {
                $step2Validated = true;
            }
        }

        if (!$step1Validated && !$step2Validated) {
            $this->logger->error('App configuration', ['user_errors' => $v1->getErrors()]);
            $this->logger->error('App configuration', ['settings_errors' => $v2->getErrors()]);
            $this->renderJson(['userErrors' => $v1->getErrors(),'settingsErrors' => $v2->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
        else if (!$step1Validated) {
            $this->logger->error('App configuration', ['user_errors' => $v1->getErrors()]);
            $this->renderJson(['userErrors' => $v1->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
        else if (!$step2Validated) {
            $this->logger->error('App configuration', ['settings_errors' => $v2->getErrors()]);
            $this->renderJson(['settingsErrors' => $v2->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
        else {
            $user   = new User();
            $user->email        = $form['email'];
            $user->username     = $form['username'];
            $user->role         = UserRole::ADMIN;
            $user->status       = UserStatus::ACTIVE;

            try {
                //$user->save();
                $this->logger->info('App configuration', ['user' => $user->toArray()]);

                $setting   = new Setting();
                $defaultSettings    = $setting->find([], ['limit' => 1])->current();

                $defaultSettings->company_name = $form['company_name'];
                $defaultSettings->company_website = $form['company_url'];
                $defaultSettings->platform_name = $form['platform_name'];
                if ($form['term_url'] != '')
                    $defaultSettings->terms_use = $form['term_url'];
                if ($form['policy_url'] != '')
                    $defaultSettings->privacy_policy = $form['policy_url'];
                //$defaultSettings->logo = $form['logo'];
                $colors = $form['branding_colors'];
                $defaultSettings->primary_color = $colors['primary_color'];
                $defaultSettings->secondary_color = $colors['secondary_color'];
                $defaultSettings->accent_color = $colors['accent_color'];
                $defaultSettings->additional_color = $colors['add_color'];

                try {
                    //$defaultSettings->save();
                    $this->logger->info('App configuration', ['setting' => $defaultSettings->toArray()]);

                    $presets = $form['presetsConfig'];
                    foreach ($presets as $preset) {
                        $subcategories = $preset['subcategories'];
                        foreach ($subcategories as $subcategory) {
                            $presetSettings = new PresetSetting();
                            $presetSettings->subcategory_id = $subcategory['id'];
                            $presetSettings->is_enabled     = $subcategory['status'];
                            try {
                                //$presetSettings->save();
                                $this->logger->info('App configuration', ['preset settings' => $presetSettings->toArray()]);
                            }
                            catch (\Exception $e) {
                                $message = $e->getMessage();
                                $this->logger->error('preset settings could not be added', ['error' => $message]);
                                $this->renderJson(['presetsErrors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                                return;
                            }
                        }
                    }
                    //$this->logger->info('administrator and settings and presets successfully added', ['user' => $user->toArray()]);
                    $this->renderJson(['message' => 'Application is ready now !']);
                }
                catch (\Exception $e) {
                    $message = $e->getMessage();
                    $this->logger->error('settings could not be added', ['error' => $message]);
                    $this->renderJson(['settingsErrors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                    return;
                }
            }
            catch (\Exception $e) {
                $message = $e->getMessage();
                $this->logger->error('administrator could not be added', ['error' => $message]);
                $this->renderJson(['userErrors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                return;
            }
        }
        //}
    }

    public function collectPresets($f3, $params): void
    {
        $data = array();
        $preset_category    = new PresetCategory();
        $categories         = $preset_category->find([], ['order' => 'id']);

        if ($categories) {
            foreach ($categories as $category) {
                $categoryData = [
                    'name'          => $category->name,
                    'icon'          => $category->icon,
                    'subcategories' => array()
                ];
                $preset_subcategory = new PresetSubCategory();
                $subcategories      = $preset_subcategory->find(['category_id = ?', $category->id], ['order' => 'id']);
                if ($subcategories) {
                    foreach ($subcategories as $subcategory) {
                        $subCategoryData = [
                            'id'        => $subcategory->id,
                            'name'      => $subcategory->name,
                            'status'    => false
                        ];
                        array_push($categoryData['subcategories'],$subCategoryData);
                    }
                }
                array_push($data,$categoryData);
            }
        }

        $this->logger->info('collecting presets', ['data' => json_encode($data)]);
        $this->renderJson(json_encode($data));
    }

    public function collectSettings($f3, $params): void
    {
        $data = array();
        $setting            = new Setting();
        $defaultSettings    = $setting->find([], ['limit' => 1])->current();

        if ($defaultSettings) {
            $data = [
                'company_name'      => $defaultSettings->company_name,
                'company_website'   => $defaultSettings->company_website,
                'platform_name'     => $defaultSettings->platform_name,

                'primary_color'     => $defaultSettings->primary_color,
                'secondary_color'   => $defaultSettings->secondary_color,
                'accent_color'      => $defaultSettings->accent_color,
                'additional_color'  => $defaultSettings->additional_color,
            ];
        }

        $this->logger->info('collecting settings', ['data' => json_encode($data)]);
        $this->renderJson(json_encode($data));
    }

    public function saveLogo($f3, $params): void
    {
        // @todo for future tasks
        //if ($f3->get('system.installed') === false) {
        $files  = $f3->get("FILES");
        $form   = $f3->get("POST");
        $v      = new Validator();

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
            }
            catch (\Exception $e) {
                $message = $e->getMessage();
                $this->logger->error('logo could not be updated', ['error' => $message]);
                $this->renderJson(['errors' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                return;
            }
        }
        //}

    }
}