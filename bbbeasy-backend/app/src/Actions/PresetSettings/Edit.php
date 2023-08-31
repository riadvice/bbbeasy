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

namespace Actions\PresetSettings;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\GuestPolicy;
use Enum\ResponseCode;
use Models\Preset;
use Models\PresetSetting;

class Edit extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body         = $this->getDecodedBody();
        $form         = $body['data'];
        $categoryName = $body['category'];

        $presetSetting = new PresetSetting();
        $settings      = $presetSetting->find(['group = ?', $categoryName], ['order' => 'id']);
        if ($settings) {
            // update preset setting
            foreach ($settings as $index => $setting) {
                $editedSubCategory = $form[$index];
                if ($setting->name === $editedSubCategory['name']) {
                    $setting->enabled = $editedSubCategory['enabled'];
                    $setting->save();
                }
            }

            // update column settings in user presets table
            $preset       = new Preset();
            $userPresets  = $preset->find();
            $errorMessage = 'User Preset could not be updated';
            foreach ($userPresets as $userPreset) {
                $userCategories = json_decode($userPreset['settings']);
                if (property_exists($userCategories, $categoryName)) {
                    $userSubCategories = json_decode($userCategories->{$categoryName});

                    foreach ($form as $editedSubCategory) {
                        $subCategoryName = $editedSubCategory['name'];
                        // enable disabled category
                        if ($editedSubCategory['enabled'] && null === $userSubCategories) {
                            $userSubCategories = (object) [$subCategoryName => ''];
                        } elseif (null !== $userSubCategories) {
                            // remove disabled category from userSubCategories
                            if (!$editedSubCategory['enabled'] && property_exists($userSubCategories, $subCategoryName)) {
                                unset($userSubCategories->{$subCategoryName});
                            }
                            // add enabled category from userSubCategories
                            if ($editedSubCategory['enabled'] && !property_exists($userSubCategories, $subCategoryName)) {
                                if (\Enum\Presets\GuestPolicy::POLICY === $subCategoryName) {
                                    $userSubCategories->{$subCategoryName} = GuestPolicy::ALWAYS_ACCEPT;
                                } else {
                                    $userSubCategories->{$subCategoryName} = '';
                                }
                            }
                        }
                    }

                    // disable enabled category
                    if (0 === \count((array) $userSubCategories)) {
                        $userCategories->{$categoryName} = 'null';
                    } else {
                        $userCategories->{$categoryName} = json_encode($userSubCategories);
                    }

                    $userPreset['settings'] = json_encode($userCategories);

                    try {
                        $userPreset->save();
                    } catch (\Exception $e) {
                        $this->logger->error($errorMessage, ['preset' => $userPreset->toArray(), 'error' => $e->getMessage()]);
                        $this->renderJson(['errors' => $errorMessage], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        return;
                    }
                }
            }
            $this->renderJson(['result' => 'success', 'settings' => $presetSetting->getCategoryInfos($categoryName)]);
        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
