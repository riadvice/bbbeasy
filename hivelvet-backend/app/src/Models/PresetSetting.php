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

namespace Models;

use DateTime;
use Models\Base as BaseModel;

/**
 * Class PresetSetting.
 *
 * @property int      $id
 * @property string   $group
 * @property string   $name
 * @property bool     $enabled
 * @property DateTime $created_on
 * @property DateTime $updated_on
 */
class PresetSetting extends BaseModel
{
    protected $table = 'preset_settings';

    public function getDefaultPresetSettings($enabled = false): array
    {
        $data       = [];
        $preset     = new Preset();
        $categories = $preset->getPresetCategories();
        if ($categories) {
            foreach ($categories as $category) {
                $categoryName = $preset->getCategoryName($category);

                $class        = new \ReflectionClass($category);
                $categoryData = [
                    'name'          => $categoryName,
                    'subcategories' => [],
                ];
                $attributes = $class->getReflectionConstants();
                foreach ($attributes as $attribute) {
                    $attributeName = $attribute->name;
                    if (!str_ends_with($attributeName, '_TYPE')) {
                        $subCategory     = $class->getConstant($attributeName);
                        $subCategoryData = [
                            'name'    => $subCategory,
                            'enabled' => $enabled,
                        ];
                        $categoryData['subcategories'][] = $subCategoryData;
                    }
                }

                $data[] = $categoryData;
            }
        }

        return $data;
    }

    public function getAllPresets(): array
    {
        $data           = [];
        $presetSettings = $this->find();
        if ($presetSettings) {
            $data = $presetSettings->castAll(['id', 'group', 'name', 'enabled']);
        }

        return $data;
    }

    public function getByGroup(string $group): self
    {
        $this->load(['group = ?', $group]);

        return $this;
    }

    public function getByName(string $name): self
    {
        $this->load(['name = ?', $name]);

        return $this;
    }

    public function savePresetSettings(array $presets): bool|string
    {
        foreach ($presets as $preset) {
            $subcategories = $preset['subcategories'];
            foreach ($subcategories as $subcategory) {
                $presetSettings          = new self();
                $presetSettings->group   = $preset['name'];
                $presetSettings->name    = $subcategory['name'];
                $presetSettings->enabled = $subcategory['enabled'];

                // @fixme: should not have embedded try/catch here
                try {
                    $presetSettings->save();
                } catch (\Exception $e) {
                    $message = $e->getMessage();
                    $this->logger->error('Initial application setup : Preset settings could not be added', ['error' => $message]);

                    return $message;
                }
                $this->logger->info('Initial application setup : Add preset settings', ['preset' => $presetSettings->toArray()]);
            }
        }

        return true;
    }
}
