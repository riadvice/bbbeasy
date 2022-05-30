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
use Models\PresetCategory;
use Models\PresetSetting;
use Models\SubCategory;
use Models\SubCategoryPreset;

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
        $body = $this->getDecodedBody();
        $this->logger->info(' body', $body);

       $form        = $body['data'];

        $preset = new Preset();
        $preset->name = $form["name"];
        try {
            $preset->save();
            $presetData = [
                'name'   => $preset->name,
                'categories' => [],
            ];
        } catch (\Exception $e) {
            $message = '  could not be added';
            $this->logger->error('  could not be added', ['error' => $e->getMessage()]);
            $this->renderJson(['message' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

            return;
        }

        $presetsett = new PresetSetting();


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
        if ($categories) {
            foreach ($categories as $category1) {
                $categoryName = explode('\\', $category1)[2];
                preg_match_all('/[A-Z]/', $categoryName, $matches, PREG_OFFSET_CAPTURE);
                $secondMajOcc = \array_key_exists(1, $matches[0]) ? $matches[0][1][1] : null;
                if ($secondMajOcc && 'ZcaleRight' !== $categoryName) {
                    $categoryName = mb_substr($categoryName, 0, $secondMajOcc) . ' ' . mb_substr($categoryName, $secondMajOcc);
                }
                $class         = new \ReflectionClass($category1);
                $modelInstance = $class->newInstance();

                $presetsettings = $presetsett->getByGroup($categoryName);
                while(!$presetsettings->dry()) {

                    $category = new PresetCategory();
                     $category=$category->getByName($categoryName);

                  if(!$category->categoryExists($categoryName)){


                        $category->name = $categoryName;
                        $category->enabled = false;

                        if ($presetsettings->enabled) {
                            $category->enabled = true;
                        }

                        $class = new \ReflectionClass($category1);


                      $modelInstance = $class->newInstance();
                        $categoryIcon = $modelInstance::staticProperties()['icon'];
                        $category->icon=$categoryIcon;
                        try {
                            $category->save();

                        } catch (\Exception $e) {
                            $message = 'category ' . $categoryName . '  could not be added';
                            $this->logger->error('  could not be added', ['error' => $e->getMessage()]);
                            $this->renderJson(['message' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        }
                    }
                  $i=0;
                  while (!$category->dry()) {
                        if(!in_array($category->name,$presetData["categories"]) ){
                            $categoryData  = [
                                'name'          => $categoryName,
                                'icon'          => $categoryIcon,
                                'subcategories' => [],
                            ];
                            $presetData["categories"][]=$categoryData;
                        }
                         $i++;

                        $subcategory = new SubCategory();
                        if (!$subcategory->nameExists($presetsettings->name) || !$subcategory->categoryExists($category->id)) {
                            $subcategory->category_id = $category->id;
                            $subcategory->name = $presetsettings->name;
                            $subCategory     =  strtoupper(str_replace(' ', '_', $subcategory->name)."_type");
                            $subcategory->type=$class->getProperty($subCategory)->getValue();
                            try {
                                $subcategory->save();

                            } catch (\Exception $e) {
                                $message = 'sub category ' . $presetsettings->name . '  could not be added';
                                $this->logger->error('  could not be added', ['error' => $e->getMessage()]);
                                $this->renderJson(['message' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);


                            }
                        }else{

                        }

                       if($subcategory->findByCategory($category->id)) {
                           while(!$subcategory->dry()) {
                               $subCategory     =  strtoupper(str_replace(' ', '_', $subcategory->name)."_type");


                               $presetSubCategory = new SubCategoryPreset();
                               if(!$presetSubCategory->PresetAndSubCategoryExists($preset->id,$subcategory->id)){
                                   $presetSubCategory->data = json_encode(array("enabled" => $presetsettings->enabled));
                                   $presetSubCategory->sub_category_id = $subcategory->id;
                                   $presetSubCategory->preset_id = $preset->id;
                                   try {
                                       $presetSubCategory->save();
                                       $subcategoryData=[
                                           "name"=>$subcategory->name,
                                           "data"=>json_decode($presetSubCategory->data)->enabled,
                                       ];

                                   } catch (\Exception $e) {
                                       $message = 'preset sub category ' . $presetSubCategory->id . '  could not be added';
                                       $this->logger->error('  could not be added', ['error' => $e->getMessage()]);
                                       $this->renderJson(['message' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                                   }
                               }

                               $subcategory->next();

                           }
                       }


                        $category->next();

                    }

                   $presetsettings->next();

                }


            }
        }
        $this->renderJson(['result' => 'success', 'preset' => $preset->getPresetInfos()], ResponseCode::HTTP_CREATED);

    }
}