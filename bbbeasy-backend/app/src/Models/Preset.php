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
        return $this->load(['lower(name) = ? and user_id = ? and id != ?', mb_strtolower($name), $userId, $id]);
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

        $enabledCategories        = json_decode($myPreset['settings']);
        $categoriesData           = $this->getMyPresetCategories($enabledCategories);
        $presetData['categories'] = $categoriesData;

        $room                   = new Room();
        $rooms                  = $room->collectAllByPresetId($myPreset['id']);
        $presetData['nb_rooms'] = \count($rooms);

        return $presetData;
    }

    public function getMyPresetCategories($enabledCategories): array
    {
        $categoriesData = [];
        $categories     = $this->getPresetCategories();
        if ($categories) {
            foreach ($categories as $category) {
                $categoryName = $this->getCategoryName($category);

                $class         = new \ReflectionClass($category);
                $subcategories = [];

                // the enabled categ with enabled subcategories
                if (json_decode($enabledCategories->{$categoryName})) {
                    foreach ($class->getReflectionConstants() as $constant) {
                        if (!str_ends_with($constant->name, '_TYPE')) {
                            $subCategory     = $constant->name;
                            $subCategoryName = $class->getConstant(mb_strtoupper($subCategory));
                            if (str_contains($subCategory, 'PASSWORD')) {
                                $subCategory = str_ireplace('PASSWORD', 'PASS', $subCategory);
                            }
                            $subCategoryType  = $class->getConstant(mb_strtoupper($subCategory) . '_TYPE');
                            $subCategoryValue = json_decode($enabledCategories->{$categoryName})->{$subCategoryName};
                            if (isset($subCategoryValue)) {
                                $subcategories[] = [
                                    'name'  => $subCategoryName,
                                    'type'  => $subCategoryType,
                                    'value' => $subCategoryValue,
                                ];
                            }
                        }
                    }
                    $categoriesData[] = [
                        'name'          => $categoryName,
                        'enabled'       => true,
                        'subcategories' => $subcategories,
                    ];
                } else { // disabled categ
                    $categoriesData[] = [
                        'name'          => $categoryName,
                        'enabled'       => false,
                        'subcategories' => $subcategories,
                    ];
                }
            }
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

    /**
     * @throws \ReflectionException
     */
    public function getPresetSettings(): array
    {
        $preset         = new self();
        $categories     = $preset->getPresetCategories();
        $presetSettings = [];
        $settings       = [];

        if ($categories) {
            foreach ($categories as $category) {
                // get category name
                $categoryName = $preset->getCategoryName($category);

                // get the reflexion classes of category class
                $class      = new \ReflectionClass($category);
                $attributes = $class->getConstants();
                $presetSett = new PresetSetting();

                foreach ($attributes as $attribute) {
                    $presetSettings = $presetSett->getByNameAndGroup($attribute, $categoryName);

                    if (!$presetSettings->dry() && $presetSettings->enabled) {
                        if (!$settings[$categoryName]) {
                            if (GuestPolicy::GROUP_NAME === $categoryName && GuestPolicy::POLICY === $presetSettings->name) {
                                $settings += [$categoryName => [$presetSettings->name => \Enum\GuestPolicy::ALWAYS_ACCEPT]];
                            } elseif (Layout::GROUP_NAME === $categoryName || Screenshare::GROUP_NAME === $categoryName) {
                                $settings += [$categoryName => [$presetSettings->name => true]];
                            } else {
                                $settings += [$categoryName => [$presetSettings->name => '']];
                            }
                        } else {
                            if (GuestPolicy::GROUP_NAME === $categoryName && GuestPolicy::POLICY === $presetSettings->name) {
                                $settings[$categoryName] += [$presetSettings->name => \Enum\GuestPolicy::ALWAYS_ACCEPT];
                            } elseif (Layout::GROUP_NAME === $categoryName) {
                                $settings[$categoryName] += [$presetSettings->name => true];
                            } else {
                                $settings[$categoryName] += [$presetSettings->name => ''];
                            }
                        }
                    }
                }

                $settings[$categoryName] = json_encode($settings[$categoryName]);
            }
        }

        return $settings;
    }
}
