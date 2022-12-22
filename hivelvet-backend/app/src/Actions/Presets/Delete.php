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
            try {
                $room  = new Room();
                $rooms = $room->collectAllByPresetId($presetId);
                foreach ($rooms as $r) {
                    $defaultpreset = $preset->getDefaultOneByUserId($r['user_id']);
                    foreach ($defaultpreset as $df) {
                        if ('default' === $df['name']) {
                            $r['preset_id'] = $df['id'];
                            $room->load(['id = ?', $r['id']]);
                            $room->preset_id = $df['id'];
                            $room->save();
                        }
                    }
                }
                $preset->erase();
            } catch (\Exception $e) {
                $message = 'preset  could not be deleted';
                $this->logger->error($message, ['preset' => $preset->toArray(), 'error' => $e->getMessage()]);
                $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }
            $this->logger->info('preset successfully deleted', ['preset' => $presetId]);
            $this->renderJson(['result' => 'success']);
        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
