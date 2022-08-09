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
use Models\Preset;
use Models\PresetCategory;
use Models\PresetSetting;
use Models\SubCategory;
use Models\SubCategoryPreset;

/**
 * Class Collect.
 */
class CollectMyPresets extends BaseAction
{
    /**
     * @param Base  $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        $user_id = $f3->get('PARAMS.user_id');

        $data = [];
        $classes = get_declared_classes();
        $autoloaderClassName = '';
        foreach ($classes as $className) {
            if (str_starts_with($className, 'ComposerAutoloaderInit')) {
                $autoloaderClassName = $className;

                break;
            }
        }
        $classLoader = $autoloaderClassName::getLoader();
        $classMap = $classLoader->getClassMap();
        $categories = preg_filter('/^Enum\\\Presets\\\[A-Z a-z]*/', '$0', array_keys($classMap));


        $preset = new Preset();
        $presets = $preset->collectAllByUserId($user_id);
        $presetsData = [];

        foreach ($presets as $preset1) {


            $presetData = [
                "id" => $preset1["id"],
                "name" => $preset1["name"],
                "user_id"=>$preset1["user_id"],
                "categories" => json_decode($preset1["settings"])
            ];
            $enabledcategories = json_decode($preset1["settings"]);
            $categoryData = [];
            foreach ($categories as $category) {
                $categoryName = explode('\\', $category)[2];

                preg_match_all('/[A-Z]/', $categoryName, $matches, PREG_OFFSET_CAPTURE);
                $secondMajOcc = \array_key_exists(1, $matches[0]) ? $matches[0][1][1] : null;
                if ($secondMajOcc && 'ZcaleRight' !== $categoryName) {
                    $categoryName = mb_substr($categoryName, 0, $secondMajOcc) . ' ' . mb_substr($categoryName, $secondMajOcc);
                }


                $class = new \ReflectionClass($category);
                $subcategories = [];
                if (isset($enabledcategories->$categoryName)) {
                foreach ($class->getConstants() as $attribute) {



                        if (isset(json_decode($enabledcategories->$categoryName)->$attribute)) {

                            $subcategories[] = ["name" => $attribute, "enabled" => true, "type" => $class->getProperty(strtoupper(str_replace(" ", "_", $attribute)) . "_TYPE")->getValue(), "value" => json_decode($enabledcategories->$categoryName)->$attribute];

                        } else {
                            $subcategories[] = ["name" => $attribute, "enabled" => false, "type" => $class->getProperty(strtoupper(str_replace(" ", "_", $attribute)) . "_TYPE")->getValue()];

                        }



                }
                $categoryData[] = ["name" => $categoryName,
                    "enabled" => true,
                    "subcategories" => $subcategories];
            }
        else{
                $categoryData[] = ["name" => $categoryName,
                    "enabled" => false,
                    "subcategories" => $subcategories];
            }
        }


            $presetData["categories"]=$categoryData;
            $presetsData[]=$presetData;
        }


        $this->logger->debug('collecting presets', ['data' => json_encode($presetsData)]);
        $this->renderJson($presetsData);
    }

}
