<?php

namespace Models;

use DateTime;
use Models\Base as BaseModel;

/**
 * Class Setting
 * @property int        $id
 * @property string     $name
 * @property int        $category_id
 * @property DateTime   $created_on
 * @property DateTime   $updated_on
 * @package  Models
 */
class PresetSubCategory extends BaseModel
{
    protected $table = 'preset_sub_categories';
}