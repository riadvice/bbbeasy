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
      $preset  = new Preset();
        $presets = $preset->collectAll();
        $presetsData=[];
        foreach($presets as $preset) {
            $category = new PresetCategory();
            $categories = $category->collectAll();
            $presetData=[
                "id"=>$preset["id"],
                "name"=>$preset["name"],
                "categories"=>[],
            ];
            if ($categories) {
                $categoriesData=[];
                foreach ($categories as $category) {

                    $categoryData = [
                        'name' => $category["name"],
                        'icon' => $category['icon'],
                        'enabled' => $category["enabled"],
                        'subcategories' => [],
                    ];


                    $subcategory = new SubCategory();
                  $subcategories = $subcategory->findByCategory($category["id"]);
                    $subcategoriesData=[];
                  while(!$subcategories->dry()){
                      $presetSubCategory=new SubCategoryPreset();
                      $presetsSubCategory=$presetSubCategory->findByPresetAndSubCategory($preset["id"],$subcategories->id);
                      while(!$presetsSubCategory->dry()){
                          $subCategoryData = [
                              'name'   => $subcategories->name,
                              'enabled' => json_decode($presetsSubCategory->data)->enabled,
                              'type'=>$subcategory->type,
                              'id'=>$presetSubCategory->id,
                              'value'=>json_decode($presetsSubCategory->data)->value
                          ];
                          $subcategoriesData[]=$subCategoryData;
                           $presetsSubCategory->next();
                      }
                      $subcategories->next();

                  }
                    $categoryData["subcategories"]=$subcategoriesData;

                    $categoriesData[] = $categoryData;
                }
                $presetData["categories"]=$categoriesData;
                $presetsData[]=$presetData;
            }
        }


        $this->logger->debug('collecting presets', ['data' => json_encode($presetsData)]);
        $this->renderJson($presetsData);
    }
    public function show($f3, $params): void{
        $presetSetting=new PresetSetting();
        $presets=$presetSetting->getAllPresets();
        $this->logger->debug('collecting presets', ['presets' => json_encode($presets)]);
        $this->renderJson($presets);
    }
}
