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
    $form=$body;
      // $form        = $body['data'];
       echo $body["name"];
        $preset = new Preset();
        $preset->name = $form["name"];
       // $preset->settings=json_encode(array());
   //     $preset->user_id=17;
        try {
         //   $preset->save();
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


        $preset_settings=array();
        $settings=[];
        $data = [];
        $classes = get_declared_classes();
        //Returns all the declared classes
        $autoloaderClassName = '';
        foreach ($classes as $className) {
            if (str_starts_with($className, 'ComposerAutoloaderInit')) {
                //get the autoloader classname that starts with ComposerAutoloaderInit

                $autoloaderClassName = $className;

                break;
            }
        }
        
        $classLoader = $autoloaderClassName::getLoader();
         //load all classes
        $classMap = $classLoader->getClassMap();
      //Apply a filter to classes under the Enum\Presets
    $categories = preg_filter('/^Enum\\\Presets\\\[A-Z a-z]*/', '$0', array_keys($classMap));
   // var_dump($categories);
       if ($categories) {

            foreach ($categories as $category1) {
               //get Catgory Name
                $categoryName = explode('\\', $category1)[2];

                preg_match_all('/[A-Z]/', $categoryName, $matches, PREG_OFFSET_CAPTURE);
                //get the second index occurence of Capital letter from category names
                $secondMajOcc = \array_key_exists(1, $matches[0]) ? $matches[0][1][1] : null;

                if ($secondMajOcc && 'ZcaleRight' !== $categoryName) {
                    //update the category names that have 2 capital letters and split them by space
                    $categoryName = mb_substr($categoryName, 0, $secondMajOcc) . ' ' . mb_substr($categoryName, $secondMajOcc);

                }
               //var_dump($categoryName);
                //get the reflexion classes of category class
                $class         = new \ReflectionClass($category1);
                $modelInstance = $class->newInstance();
                $attributes = $class->getConstants();

                //search preset settings by category
                 $presetsett=new PresetSetting();
                // $presetsettings = $presetsett->getByGroup($categoryName);
                // var_dump($presetsettings);
               // echo $categoryName;
                foreach ($attributes as $attribute) {
                    $attribute = ucfirst(str_replace('_', ' ', $attribute));
                    //echo "name ".$attribute;
                    $preset_settings = $presetsett->getByName($attribute);


                    if (!$preset_settings->dry()) {
                        if ($preset_settings->enabled && $preset_settings->group == $categoryName) {
                            if(!$settings[$categoryName]) {
                                //$settings[$categoryName]=array();
                              //  $settings->$categoryName
                            }
                            $settings+=array($categoryName=>json_encode(array($preset_settings->name => "")));
                           // $settings[$categoryName][]= json_encode(array($preset_settings->name => ""));



                        }
                    }

                }
                var_dump(json_encode($settings));

            }

       }

        // var_dump(json_encode($preset_settings));
       $preset->settings=json_encode($settings);

       $preset->user_id=17;
      $preset->save();
        $this->renderJson(['result' => 'success', 'preset' => $preset->getPresetInfos()], ResponseCode::HTTP_CREATED);

    }
}