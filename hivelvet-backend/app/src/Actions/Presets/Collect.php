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
use Models\PresetCategory;
use Models\PresetSubCategory;

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
        $data            = [];
        $preset_category = new PresetCategory();
        $categories      = $preset_category->find([], ['order' => 'id']);

        if ($categories) {
            foreach ($categories as $category) {
                $categoryData = [
                    'name'          => $category->name,
                    'icon'          => $category->icon,
                    'subcategories' => [],
                ];
                $preset_subcategory = new PresetSubCategory();
                $subcategories      = $preset_subcategory->find(['category_id = ?', $category->id], ['order' => 'id']);
                if ($subcategories) {
                    foreach ($subcategories as $subcategory) {
                        $subCategoryData = [
                            'id'     => $subcategory->id,
                            'name'   => $subcategory->name,
                            'status' => false,
                        ];
                        $categoryData['subcategories'][] = $subCategoryData;
                    }
                }
                $data[] = $categoryData;
            }
        }

        $this->logger->info('collecting presets', ['data' => json_encode($data)]);
        $this->renderJson(json_encode($data));
    }
}
