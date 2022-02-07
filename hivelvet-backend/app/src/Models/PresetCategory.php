<?php

namespace Models;

use DateTime;
use Models\Base as BaseModel;

/**
 * Class Setting
 * @property int        $id
 * @property string     $name
 * @property string     $icon
 * @property DateTime   $created_on
 * @property DateTime   $updated_on
 * @package  Models
 */
class PresetCategory extends BaseModel
{
    protected $table = 'preset_categories';
}