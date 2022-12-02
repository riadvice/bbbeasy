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

namespace Actions\Presets;

use Actions\Base as BaseAction;
use Base;
use Enum\ResponseCode;
use Models\Preset;
use Models\PresetSetting;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Add.
 */
class Add extends BaseAction
{

    /**
     * @param Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body        = $this->getDecodedBody();
        $form        = $body['data'];
        $userId      = $body['user_id'];
        $dataChecker = new DataChecker();

        $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));
        $dataChecker->verify($userId, Validator::notEmpty()->setName('user_id'));

        $errorMessage = 'Preset could not be added';
        $successMessage = 'Preset successfully added';
        if ($dataChecker->allValid()) {
            $checkPreset = new Preset();
            $preset = new Preset();
            $preset->name = $form['name'];
            if ($checkPreset->nameExists($preset->name, $userId)) {
                $this->logger->error($errorMessage, ['error' => 'Name already exists']);
                $this->renderJson(['errors' => ['name' => 'Name already exists']], ResponseCode::HTTP_PRECONDITION_FAILED);
            } else {
                $result = $this->addDefaultPreset($preset, $userId, $successMessage, $errorMessage);
                if ($result) {
                    $this->renderJson(['result' => 'success', 'preset' => $preset->getMyPresetInfos($preset)], ResponseCode::HTTP_CREATED);
                }
            }
        } else {
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function addDefaultPreset($preset, $userId, $successMessage, $errorMessage) : bool
    {
        try {
            $settings = $this->getPresetSettings();
            $preset->settings = json_encode($settings);
            $preset->user_id = $userId;
            $preset->save();
        } catch (\Exception $e) {
            $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
            $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
            return false;
        }
        $this->logger->info($successMessage, ['default preset' => $preset->toArray()]);
        return true;
    }

    public function getPresetSettings() : array
    {
        $preset = new Preset();
        $categories = $preset->getPresetCategories();
        $presetSettings = array();
        $settings = [];
        if ($categories) {
            foreach ($categories as $category) {
                //get category name
                $categoryName = $preset->getCategoryName($category);

                //get the reflexion classes of category class
                $class      = new \ReflectionClass($category);
                $attributes = $class->getConstants();
                $presetSett = new PresetSetting();

                foreach ($attributes as $attribute) {
                    $presetSettings = $presetSett->getByName($attribute);
                    if (!$presetSettings->dry() && $presetSettings->enabled) {
                        if (!$settings[$categoryName]) {
                            $settings += array($categoryName => array($presetSettings->name => ""));
                        } else {
                            $settings[$categoryName] += (array($presetSettings->name => ""));
                        }
                    }
                }
                $settings[$categoryName] = json_encode($settings[$categoryName]);
            }
        }

        return $settings;
    }
}
