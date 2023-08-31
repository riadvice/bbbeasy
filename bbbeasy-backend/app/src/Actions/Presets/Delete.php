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

use Actions\Delete as DeleteAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Preset;
use Models\Room;

/**
 * Class Delete.
 */
class Delete extends DeleteAction
{
    use RequirePrivilegeTrait;

    public function execute($f3, $params): void
    {
        $preset   = new Preset();
        $presetId = $params['id'];
        $preset->load(['id = ?', $presetId]);
        if ($preset->valid()) {
            if ('default' !== $preset->name) {
                try {
                    $room  = new Room();
                    $rooms = $room->collectAllByPresetId($presetId);
                    foreach ($rooms as $r) {
                        $defaultPreset = $preset->getDefaultOneByUserId($r['user_id']);
                        if (!$defaultPreset->dry()) {
                            $room->load(['id = ?', $r['id']]);
                            $room->preset_id = $defaultPreset->id;
                            $room->save();
                        }
                    }
                    $preset->erase();
                } catch (\Exception $e) {
                    $message = 'preset could not be deleted';
                    $this->logger->error($message, ['preset' => $preset->toArray(), 'error' => $e->getMessage()]);
                    $this->renderJson(['message' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
                }
                $this->logger->info('preset successfully deleted', ['preset' => $presetId]);
                $this->renderJson(['result' => 'success']);
            } else {
                $message = 'default preset could not be deleted';
                $this->logger->error($message, ['preset' => $preset->toArray(), 'error' => $message]);
                $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
