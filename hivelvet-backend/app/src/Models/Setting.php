<?php

/**
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
 * Class Setting
 * @property int        $id
 * @property string     $company_name
 * @property string     $company_website
 * @property string     $platform_name
 * @property string     $terms_use
 * @property string     $privacy_policy
 * @property string     $logo
 * @property string     $primary_color
 * @property string     $secondary_color
 * @property string     $accent_color
 * @property string     $additional_color
 * @property DateTime   $created_on
 * @property DateTime   $updated_on
 * @package  Models
 */
class Setting extends BaseModel
{
    protected $table = 'settings';
}