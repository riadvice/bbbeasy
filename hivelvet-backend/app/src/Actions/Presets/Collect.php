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

/**
 * Class Collect.
 */
class Collect extends BaseAction
{
    /**
     * @param Base  $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        $data                = [];
        $res                 = get_declared_classes();
        $autoloaderClassName = '';
        foreach ($res as $className) {
            if (str_starts_with($className, 'ComposerAutoloaderInit')) {
                $autoloaderClassName = $className;
                break;
            }
        }
        $classLoader = $autoloaderClassName::getLoader();
        $classMap = $classLoader->getClassMap();

        $categories = preg_filter('/^Enum\\\Presets\\\[A-Z a-z]*/', '$0', array_keys($classMap));

        $counter = 1;
        if ($categories) {
            foreach ($categories as $category) {
                $categoryName = explode("\\", $category)[2];
                preg_match_all('/[A-Z]/', $categoryName,$matches, PREG_OFFSET_CAPTURE);
                $secondMajOcc = array_key_exists(1, $matches[0]) ? $matches[0][1][1] : null;
                if ($secondMajOcc and $categoryName != 'ZcaleRight')
                    $categoryName = substr($categoryName,0,$secondMajOcc).' '.substr($categoryName,$secondMajOcc);

                $class          = new \ReflectionClass($category);
                $modelInstance  = $class->newInstance();
                $categoryIcon   = $modelInstance::staticProperties()['icon'];
                $categoryData = [
                    'name'          => $categoryName,
                    'icon'          => $categoryIcon,
                    'subcategories' => [],
                ];
                $subCategories  = $modelInstance::values();
                foreach ($subCategories as $key => $subCategory) {
                    //$subCategories[$key] = ucfirst(str_replace('_',' ',$subCategory));
                    $subCategory = ucfirst(str_replace('_',' ',$subCategory));
                    $subCategoryData = [
                        'id'     =>$counter,
                        'name'   => $subCategory,
                        'status' => false,
                    ];
                    $categoryData['subcategories'][] = $subCategoryData;
                    $counter++;
                }

                $data[] = $categoryData;
            }
        }

        $this->logger->info('collecting presets', ['data' => json_encode($data)]);
        $this->renderJson(json_encode($data));
    }
}
