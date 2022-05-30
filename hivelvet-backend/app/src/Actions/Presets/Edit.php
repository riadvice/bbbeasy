<?php

namespace Actions\Presets;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Preset;
use Models\SubCategoryPreset;

class Edit extends BaseAction
{
   use RequirePrivilegeTrait;

    /**
     * @param Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body = $this->getDecodedBody();
        $form = $body['data'];
        $id   = $params['id'];
        $presetsubcategory    = new SubCategoryPreset();
        $presetsubcategory=$presetsubcategory->findByID($id);
        if(!$presetsubcategory->dry()){
            $data=$presetsubcategory->data;
            $data=json_decode($data,true);
          $data["value"]=$form["value"];
           $presetsubcategory->data=json_encode($data);
            try {
                $presetsubcategory->save();
            } catch (\Exception $e) {
                $this->logger->error('subcategory could not be updated', ['error' => $e->getMessage()]);
                $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }

            $this->logger->info('preset successfully updated', ['preset' => $presetsubcategory->toArray()]);
            $this->renderJson(['result' => 'success', 'preset' => $presetsubcategory->toArray()]);

        }

    }



    /**
     * @param Base $f3
     * @param array $params
     */
    public function rename($f3, $params): void
    {
        $body = $this->getDecodedBody();
       $form = $body['data'];
        $id   = $params['id'];
        $preset    = new Preset();
        $preset=$preset->findByID($id);
        if(!$preset->dry()){
          $preset->name=$form["name"];
            try {
                $preset->save();
            } catch (\Exception $e) {
                $this->logger->error('preset could not be updated', ['error' => $e->getMessage()]);
                $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }

            $this->logger->info('preset successfully updated', ['preset' => $preset->toArray()]);
            $this->renderJson(['result' => 'success', 'preset' => $preset->toArray()]);

        }

    }

}