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
 * Class PresetSetting.
 *
 * @property int      $id
 * @property string   $group
 * @property string   $name
 * @property bool     $enabled
 * @property DateTime $created_on
 * @property DateTime $updated_on
 */
class PresetSetting extends BaseModel
{
    protected $table = 'preset_settings';
    public function getAllPresets(): array
    {
        return $this->db->exec("SELECT id,  group,name, enabled FROM preset_settings");
    }
    public function getByGroup(string $group): self
    {
        $this->load(['group = ?', $group]);

        return $this;
    }
}
