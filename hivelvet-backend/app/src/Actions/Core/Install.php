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

            $user   = new User();
            $user->email        = $form['email'];
            $user->username     = $form['username'];
            $user->role         = UserRole::ADMIN;
            $user->status       = UserStatus::ACTIVE;

            try {
                //$user->save();

                $this->logger->info('App configuration', ['user' => $user->toArray()]);
                $setting   = new Setting();
                $setting->company_name = $form['company_name'];
                $setting->company_website = $form['company_url'];
                $setting->platform_name = $form['platform_name'];
                if ($form['term_url'] != '')
                    $setting->terms_use = $form['term_url'];
                if ($form['policy_url'] != '')
                    $setting->privacy_policy = $form['policy_url'];
                //$setting->logo = $form['logo'];
                $colors = $form['branding_colors'];
                $setting->primary_color = $colors['primary_color'];
                $setting->secondary_color = $colors['secondary_color'];
                $setting->accent_color = $colors['accent_color'];
                $setting->additional_color = $colors['add_color'];

                try {
                    //$setting->save();
                    $this->logger->info('App configuration', ['setting' => $setting->toArray()]);

                    $presets = $form['presetsConfig'];
                    foreach ($presets as $preset) {
                        $subcategories = $preset['subcategories'];
                        foreach ($subcategories as $subcategory) {
                            $presetSettings = new PresetSetting();
                            $presetSettings->subcategory_id = $subcategory['id'];
                            $presetSettings->is_enabled     = $subcategory['status'];
                            try {
                                $this->logger->info('App configuration', ['preset settings' => $presetSettings->toArray()]);
                                //$presetSettings->save();
                            }
                            catch (\Exception $e) {
                                $message = $e->getMessage();
                                $this->logger->error('preset settings could not be added', ['error' => $message]);
                                $this->renderJson(['errorStep3' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
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
                    $this->renderJson(['errorStep2' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                    return;
                }
            }
            catch (\Exception $e) {
                $message = $e->getMessage();
                $this->logger->error('administrator could not be added', ['error' => $message]);
                $this->renderJson(['errorStep1' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                return;
            }
        //}
    }

    public function collect($f3, $params): void
    {
        $data = array();
        $preset_category    = new PresetCategory();
        $categories         = $preset_category->find([], ['order' => 'id']);

        if ($categories) {
            foreach ($categories as $category) {
                $categoryData = [
                    'name' => $category->name,
                    'icon' => $category->icon,
                    'subcategories' => array()
                ];
                $preset_subcategory = new PresetSubCategory();
                $subcategories      = $preset_subcategory->find(['category_id = ?', $category->id], ['order' => 'id']);
                if ($subcategories) {
                    foreach ($subcategories as $subcategory) {
                        $subCategoryData = [
                            'id' => $subcategory->id,
                            'name' => $subcategory->name,
                            'status' => false
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
}