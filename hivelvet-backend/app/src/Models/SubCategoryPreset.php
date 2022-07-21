<?php

namespace Models;
use Models\Base as BaseModel;

/**
 * Class SubCategoryPreset.
 *
 * @property int      $id
 *
 * @property int     $sub_category_id
 * @property int     $preset_id
 * @property json    $data
 * @property DateTime $created_on
 * @property DateTime $updated_on
 */
class SubCategoryPreset  extends BaseModel
{
    protected $table = 'preset_subcategories';


    public function  findByPresetAndSubCategory($preset_id,$subcategory_id){
        $this->load(['sub_category_id = ? && preset_id = ?', $subcategory_id,$preset_id]);
        return $this;
}
    public function   presetAndsubCategoryExists($preset_id,$subcategory_id){
      return  $this->load(['sub_category_id = ? && preset_id = ?', $subcategory_id,$preset_id]);

    }
    public function  findByID($id){
        $this->load(['id = ? ', $id]);
        return $this;
    }
}