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

/**
 * Class Copy.
 */
class Copy extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $preset   = new Preset();
        $presetId = $params['id'];
        $preset->load(['id = ?', $presetId]);
        $errorMessage = 'Preset could not be copied';
        if ($preset->valid()) {
            $newPreset           = new Preset();
            $newPreset->name     = $preset->name . 'Copy';
            $newPreset->settings = $preset->settings;
            $newPreset->user_id  = $preset->user_id;

            try {
                $newPreset->save();
                $newPreset = $preset->findById($presetId);
            } catch (\Exception $e) {
                $this->logger->error($errorMessage, ['preset' => $newPreset->toArray(), 'error' => $e->getMessage()]);
                $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }
            $this->renderJson(['result' => 'success', 'preset' => $newPreset->getMyPresetInfos($newPreset)], ResponseCode::HTTP_CREATED);
        } else {
            $this->logger->error($errorMessage);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
