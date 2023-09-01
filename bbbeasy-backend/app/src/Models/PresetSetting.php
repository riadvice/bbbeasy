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

namespace Models;

use Enum\Presets\Layout;
use Models\Base as BaseModel;

/**
 * Class PresetSetting.
 *
 * @property int       $id
 * @property string    $group
 * @property string    $name
 * @property bool      $enabled
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 */
class PresetSetting extends BaseModel
{
    protected const GROUP_NAME = 'GROUP_NAME';
    protected $table           = 'preset_settings';

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

                    if (self::GROUP_NAME !== $attributeName && !str_ends_with($attributeName, '_TYPE')) {
                        $subCategory     = $class->getConstant($attributeName);
                        $subCategoryData = [
                            'name'    => $subCategory,
                            'enabled' => (Layout::GROUP_NAME === $categoryName) ? true : $enabled,
                        ];
                        $categoryData['subcategories'][] = $subCategoryData;
                    }
                }

                $data[] = $categoryData;
            }
        }

        return $data;
    }

    public function collectAll(): array
    {
        $data           = [];
        $presetSettings = $this->find([], ['order', 'id']);
        if ($presetSettings) {
            $categories = $this->db->exec('select distinct(p.group) as name from preset_settings p order by p.group');
            if ($categories) {
                foreach ($categories as $category) {
                    $categoryName = $category['name'];
                    $categoryData = $this->getCategoryInfos($categoryName);
                    $data[]       = $categoryData;
                }
            }
        }

        return $data;
    }

    public function getCategoryInfos($category): array
    {
        $subCategories = $this->db->exec('select p.name, p.enabled from preset_settings p where p.group = ? order by p.id', [$category]);

        return [
            'name'          => $category,
            'subcategories' => $subCategories,
        ];
    }

    public function getAll(): array
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

    public function getByNameAndGroup(string $name, string $group): self
    {
        $this->load(['name = ? and group = ? ', $name, $group]);

        return $this;
    }

    public function savePresetSettings(array $presets): bool|string
    {
        foreach ($presets as $preset) {
            //   var_dump($preset['name']);

            $subcategories = $preset['subcategories'];

            foreach ($subcategories as $subcategory) {
                if ($subcategory['name'] !== str_replace(' ', '', $preset['name'])) {
                    $presetSetting          = new self();
                    $presetSetting->group   = $preset['name'];
                    $presetSetting->name    = $subcategory['name'];
                    $presetSetting->enabled = $subcategory['enabled'];

                    // @fixme: should not have embedded try/catch here
                    try {
                        $presetSetting->save();
                    } catch (\Exception $e) {
                        $message = $e->getMessage();
                        $this->logger->error('Initial application setup : Preset setting could not be added', ['error' => $message]);

                        return $message;
                    }

                    $this->logger->info('Initial application setup : Add preset setting', ['preset' => $presetSetting->toArray()]);
                }
            }
        }

        return true;
    }
}
