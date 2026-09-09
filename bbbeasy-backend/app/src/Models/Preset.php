<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

use Enum\Presets\General;
use Enum\Presets\GuestPolicy;
use Enum\Presets\Layout;
use Enum\Presets\Screenshare;
use Models\Base as BaseModel;

/**
 * Class Preset.
 *
 * @property int       $id
 * @property string    $name
 * @property json      $settings
 * @property int       $user_id
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 */
class Preset extends BaseModel
{
    protected $table = 'presets';

    public function __construct($db = null, $table = null, $fluid = null, $ttl = 0)
    {
        parent::__construct($db, $table, $fluid, $ttl);
    }

    public function collectAllByUserId($userId): array
    {
        $data    = [];
        $presets = $this->find(['user_id = ?', $userId], ['order' => 'created_on desc']);
        if ($presets) {
            $data = $presets->castAll(['id', 'name', 'settings']);
        }

        return $data;
    }

    public function findById($id)
    {
        $this->load(['id = ? ', $id]);

        return $this;
    }

    public function nameExists($name, $userId, $id = null)
    {
        return $this->load($this->excludeId(['lower(name) = ? and user_id = ?', mb_strtolower($name), $userId], $id));
    }

    public function getPresetCategories(): array
    {
        // returns all the declared classes
        $classes             = get_declared_classes();
        $autoloaderClassName = '';
        foreach ($classes as $className) {
            if (str_starts_with($className, 'ComposerAutoloaderInit')) {
                $autoloaderClassName = $className;

                break;
            }
        }
        $classLoader = $autoloaderClassName::getLoader();
        $classMap    = $classLoader->getClassMap();

        // filter classes under the Enum\Presets
        return preg_filter('/^Enum\\\Presets\\\[A-Z a-z]*/', '$0', array_keys($classMap));
    }

    public function getCategoryName($category): string
    {
        $categoryName = explode('\\', $category)[2];

        preg_match_all('/[A-Z]/', $categoryName, $matches, PREG_OFFSET_CAPTURE);
        $secondMajOcc = \array_key_exists(1, $matches[0]) ? $matches[0][1][1] : null;
        if ($secondMajOcc && 'ZcaleRight' !== $categoryName) {
            $categoryName = mb_substr($categoryName, 0, $secondMajOcc) . ' ' . mb_substr($categoryName, $secondMajOcc);
        }

        return $categoryName;
    }

    public function getMyPresetInfos($myPreset): array
    {
        $presetData = [
            'id'   => $myPreset['id'],
            'name' => $myPreset['name'],
        ];

        $enabledCategories        = json_decode((string) $myPreset['settings']);
        $presetData['categories'] = $this->getMyPresetCategories($enabledCategories);

        $room                   = new Room();
        $rooms                  = $room->collectAllByPresetId($myPreset['id']);
        $presetData['nb_rooms'] = \count($rooms);

        return $presetData;
    }

    public function getMyPresetCategories($enabledCategories): array
    {
        $categoriesData = [];

        foreach ($this->getPresetCategories() ?: [] as $category) {
            $categoryName = $this->getCategoryName($category);
            $values       = $this->decodeCategorySettings($enabledCategories, $categoryName);

            $categoriesData[] = [
                'name'          => $categoryName,
                'enabled'       => (bool) $values,
                'subcategories' => $values ? $this->collectSubCategories($category, (object) $values) : [],
            ];
        }

        return $categoriesData;
    }

    public function getDefaultOneByUserId($userId)
    {
        $defaultName = 'default';
        $this->load(['lower(name) = ? and user_id = ? ', mb_strtolower($defaultName), $userId]);

        return $this;
    }

    public function getByName($name): self
    {
        $this->load(['name = ? ', $name]);

        return $this;
    }

    public function addDefaultSettings($successMessage, $errorMessage): bool|string
    {
        try {
            $settings = $this->getPresetSettings();

            $this->settings = json_encode($settings);
            $this->save();
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage(), ['error' => $e->getMessage()]);

            return $errorMessage;
        }

        $this->logger->info($successMessage, ['default preset' => $this->toArray()]);

        return true;
    }

    public function getPresetSettings(): array
    {
        $preset     = new self();
        $categories = $preset->getPresetCategories();
        $settings   = [];

        if ($categories) {
            foreach ($categories as $category) {
                $categoryName = $preset->getCategoryName($category);
                $attributes   = new \ReflectionClass($category)->getConstants();
                $presetSett   = new PresetSetting();

                $categorySettings = [];
                foreach ($attributes as $attribute) {
                    $presetSetting = $presetSett->getByNameAndGroup($attribute, $categoryName);

                    if (!$presetSetting->dry() && $presetSetting->enabled) {
                        $categorySettings[$presetSetting->name] = $this->getDefaultSettingValue($categoryName, $presetSetting->name);
                    }
                }

                $settings[$categoryName] = json_encode($categorySettings);
            }
        }

        return $settings;
    }

    /**
     * Settings of one category, as they are stored inside the preset. Returns null
     * when the preset holds nothing for that category, which reads as disabled.
     *
     * @param mixed $enabledCategories
     */
    protected function decodeCategorySettings($enabledCategories, string $categoryName)
    {
        $value = \is_object($enabledCategories) ? ($enabledCategories->{$categoryName} ?? null) : null;

        return null === $value ? null : json_decode((string) $value);
    }

    /**
     * Subcategories of one category, paired with the type and the value the preset
     * holds for each of them.
     */
    protected function collectSubCategories(string $category, object $values): array
    {
        $subcategories = [];
        $class         = new \ReflectionClass($category);

        foreach ($class->getReflectionConstants() as $constant) {
            if (str_ends_with($constant->name, '_TYPE')) {
                continue;
            }

            $subCategoryName = $class->getConstant($constant->name);
            $value           = $values->{$subCategoryName} ?? null;

            if (null === $value) {
                continue;
            }

            // The type constant of a password setting is named after PASS, not PASSWORD.
            $typeConstant = str_ireplace('PASSWORD', 'PASS', $constant->name) . '_TYPE';

            $subcategories[] = [
                'name'  => $subCategoryName,
                'type'  => $class->getConstant($typeConstant),
                'value' => $value,
            ];
        }

        return $subcategories;
    }

    /**
     * @throws \ReflectionException
     */
    /**
     * Value a setting starts with when a preset is created. Everything a first
     * meeting needs is on, so a room works without touching the preset.
     *
     * @return bool|string
     */
    private function getDefaultSettingValue(string $group, string $setting)
    {
        if (GuestPolicy::GROUP_NAME === $group && GuestPolicy::POLICY === $setting) {
            return \Enum\GuestPolicy::ALWAYS_ACCEPT;
        }

        if (\in_array($group, [Layout::GROUP_NAME, Screenshare::GROUP_NAME], true)) {
            return true;
        }

        if (General::GROUP_NAME === $group && \in_array($setting, [General::ANYONE_CAN_START, General::OPEN_FOR_EVERYONE], true)) {
            return true;
        }

        return '';
    }
}
