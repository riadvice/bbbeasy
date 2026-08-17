<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

namespace Actions\Rooms\Presentations;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Room;

class Delete extends BaseAction
{
    use RequirePrivilegeTrait;
    use RoomPresentationsTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        $room = new Room();
        $room = $room->getById($params['id']);

        if (!$room->valid() || !$this->canManageRoom($room)) {
            $this->logger->warning('Access denied to room presentations delete', ['room_id' => $params['id']]);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);

            return;
        }

        $filename = basename((string) $params['filename']);
        $list     = $room->getPresentations();
        $index    = array_search($filename, $list, true);
        if (false === $index) {
            $this->logger->warning('Presentation not found for room', ['room_id' => $room->id, 'name' => $filename]);
            $this->renderJson(['errors' => ['presentation' => 'Presentation not found']], ResponseCode::HTTP_NOT_FOUND);

            return;
        }

        array_splice($list, $index, 1);
        $room->setPresentations($list);
        $room->save();

        $filePath = $this->f3->get('UPLOADS') . $filename;
        if (is_file($filePath)) {
            @unlink($filePath);
        }

        $this->logger->info('Presentation successfully deleted for room', ['room_id' => $room->id, 'name' => $filename]);
        $this->renderJson(['result' => 'success', 'name' => $filename]);
    }
}
