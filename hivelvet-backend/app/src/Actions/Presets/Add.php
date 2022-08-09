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
                //get the reflexion classes of category class
                $class         = new \ReflectionClass($category1);
                $attributes = $class->getConstants();

                 $presetsett=new PresetSetting();

                foreach ($attributes as $attribute) {
                    $attribute = ucfirst(str_replace('_', ' ', $attribute));
                    $preset_settings = $presetsett->getByName($attribute);

                    if (!$preset_settings->dry()) {
                        if ($preset_settings->enabled ) {
                             if(!$settings[$categoryName]) {

                                $settings+=array($categoryName=>array(strtolower(str_replace(" ","_",$preset_settings->name)) => ""));

                            }
                         else {
                             $settings[$categoryName] += (array(strtolower(str_replace(" ","_",$preset_settings->name)) => ""));
                         }



                        }
                        $preset_settings->next();
                    }
                }
                $settings[$categoryName]=json_encode($settings[$categoryName]);

            }

       }


       $preset->settings=json_encode($settings);

       $preset->user_id=$body["user_id"];
        try {
            $preset->save();

        } catch (\Exception $e) {
            $message = 'Preset could not be added';
            $this->logger->error('creating error : Preset could not be added', ['preset' => $preset->toArray(), 'error' => $e->getMessage()]);
            $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

            return;
        }

        $this->renderJson(['result' => 'success', 'preset' => $preset->toArray() ], ResponseCode::HTTP_CREATED);

    }
}