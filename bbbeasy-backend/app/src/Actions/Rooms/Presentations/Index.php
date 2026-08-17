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

class Index extends BaseAction
{
    use RequirePrivilegeTrait;
    use RoomPresentationsTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function show($f3, $params): void
    {
        $room = new Room();
        $room = $room->getById($params['id']);

        if (!$room->valid() || !$this->canManageRoom($room)) {
            $this->logger->warning('Access denied to room presentations', ['room_id' => $params['id']]);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);

            return;
        }

        $presentations = [];
        foreach ($room->getPresentations() as $name) {
            $presentations[] = [
                'name' => $name,
                'url'  => $this->presentationUrl($name),
            ];
        }

        $this->logger->info('Room presentations successfully collected', ['room_id' => $room->id]);
        $this->renderJson(['presentations' => $presentations]);
    }
}
