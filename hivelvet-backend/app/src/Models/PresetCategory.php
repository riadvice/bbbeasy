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
 * @property bool     $enabled
 * @property int     $preset_id
 * @property DateTime $created_on
 * @property DateTime $updated_on
 */
class PresetCategory extends BaseModel
{
    protected $table = 'preset_categories';

    public function getPresetCategoryInfos(): array
    {
        return [
            'key'         => $this->id,
            'name'        => $this->name,
            'enabled'      =>$this->enabled,
            'preset_id'    =>$this->preset_id,

        ];
    }
    public function categoryExists($name)
    {
        return $this->load(['name = ?', $name]);
    }
    /**
     * @return $this
     */
    public function getByName(string $name): self
    {
        $this->load(['name = ?', $name]);

        return $this;
    }
    public function collectAll(): array
    {
        return $this->db->exec('SELECT id, name ,enabled FROM preset_categories');
    }
}
