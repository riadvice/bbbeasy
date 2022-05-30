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

namespace Models;

use DateTime;
use Models\Base as BaseModel;

/**
 * Class Preset.
 *
 * @property int      $id
 * @property string   $name
 * @property string   $type
 * @property int     $category_id
 * @property DateTime $created_on
 * @property DateTime $updated_on
 */
class SubCategory extends BaseModel
{
    protected $table = 'subcategories';

    public function getPresetSubCategoryInfos(): array
    {
        return [
            'key'         => $this->id,
            'name'        => $this->name,
            'category_id'    =>$this->category_id,


        ];
    }
    /**
     * @return $this
     */
    public function getByName(string $name): self
    {
        $this->load(['name = ?', $name]);

        return $this;
    }
    public function nameExists($name)
    {
        return $this->load(['name = ?', $name]);
    }
    public function categoryExists($category_id)
    {
        return $this->load(['category_id = ?', $category_id]);
    }
    public function findByCategory($category_id)
    {
      $this->load(['category_id = ?', $category_id]);
      return $this;
    }
}
