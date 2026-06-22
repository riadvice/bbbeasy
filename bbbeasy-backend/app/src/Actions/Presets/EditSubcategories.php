<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with BBBeasy. If not, see <https://www.gnu.org/licenses/>
 */

namespace Actions\Presets;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Preset;

class EditSubcategories extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body         = $this->getDecodedBody();
        $id           = $params['id'];
        $form         = $body['data'];
        $categoryName = $body['title'];

        $preset       = new Preset();
        $oldPreset    = $preset->findById($id);
        $errorMessage = 'Preset could not be updated';

        if ($oldPreset->valid()) {
            $categories    = json_decode($oldPreset['settings']);
            $subCategories = [];
            if (isset($categories->{$categoryName})) {
                $subCategories = json_decode($categories->{$categoryName});
                foreach ($form as $editedSubCategory) {
                    $subCategoryName  = $editedSubCategory['name'];
                    $subCategoryValue = $editedSubCategory['value'];

                    $subCategories->{$subCategoryName} = $subCategoryValue;
                }

                $categories->{$categoryName} = json_encode($subCategories);
                $oldPreset['settings']       = json_encode($categories);

                try {
                    $oldPreset->save();
                } catch (\Exception $e) {
                    $this->logger->error($errorMessage, ['preset' => $oldPreset->toArray(), 'error' => $e->getMessage()]);
                    $this->renderJson(['errors' => $errorMessage], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
                }
                $this->renderJson(['result' => 'success', 'preset' => $preset->getMyPresetInfos($oldPreset)]);
            }
        } else {
            $this->logger->error($errorMessage);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
