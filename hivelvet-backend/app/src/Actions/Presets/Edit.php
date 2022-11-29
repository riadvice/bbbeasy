<?php

namespace Actions\Presets;

use Actions\Base as BaseAction;
use Base;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Preset;
use Models\PresetSetting;
use Respect\Validation\Validator;
use Validation\DataChecker;

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
        $id = $params['id'];
        $form = $body['data'];
        $categoryName = $body['title'];

        $preset = new Preset();
        $oldPreset = $preset->findById($id);
        if (!$oldPreset->dry()) {
            $categories = json_decode($oldPreset["settings"]);
            $subCategories = [];
            if (isset($categories->$categoryName)) {
                $subCategories = json_decode($categories->$categoryName);
                foreach ($form as $editedSubCategory) {
                    $subCategoryName = $editedSubCategory["name"];
                    $subCategoryValue = $editedSubCategory["value"];
                    
                    $subCategories->$subCategoryName = $subCategoryValue;
                }

                $categories->$categoryName = json_encode($subCategories);
                $oldPreset["settings"] = json_encode($categories);
            }
            $oldPreset->save();
            $this->renderJson(['result' => 'success', 'preset' => $preset->getMyPresetInfos($oldPreset)]);
        }
    }

    /**
     * @param Base $f3
     * @param array $params
     */
    public function rename($f3, $params): void
    {
        $body        = $this->getDecodedBody();
        $form        = $body['data'];
        $id          = $params['id'];
        $dataChecker = new DataChecker();

        $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));
        $dataChecker->verify($id, Validator::notEmpty()->setName('id'));

        $errorMessage = 'Preset could not be updated';

        $preset = new Preset();
        $preset = $preset->findById($id);
        if (!$preset->dry()) {
            if ($dataChecker->allValid()) {
                $checkPreset = new Preset();
                $preset->name = $form['name'];
                if ($checkPreset->nameExists($preset->name, $preset->user_id, $preset->id)) {
                    $this->logger->error($errorMessage, ['error' => 'Name already exists']);
                    $this->renderJson(['errors' => ['name' => 'Name already exists']],
                        ResponseCode::HTTP_PRECONDITION_FAILED);
                } else {
                    try {
                        $preset->save();
                    } catch (\Exception $e) {
                        $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
                        $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        return;
                    }
                    $this->logger->info('preset successfully updated', ['preset' => $preset->toArray()]);
                    $this->renderJson(['result' => 'success', 'preset' => $preset->getMyPresetInfos($preset)]);
                }
            } else {
                $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
            }
        }
    }

}