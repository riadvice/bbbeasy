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

use Enum\UserRole;
use Models\Room;

trait RoomPresentationsTrait
{
    /**
     * Only the room owner or an administrator can manage the room presentations.
     */
    protected function canManageRoom(Room $room): bool
    {
        $user = $this->session->get('user');
        if (null === $user) {
            return false;
        }

        // Compare the role by its identifier, the administrator role can be renamed.
        return (int) $room->user_id === (int) $user['id'] || UserRole::ADMINISTRATOR_ID === $this->session->getRoleId();
    }

    protected function presentationUrl(string $name): string
    {
        // Relative on purpose, the uploads are served by the same host as the API and
        // the Origin header points at whichever client sent the request.
        return '/api/files/' . rawurlencode($name);
    }

    protected function presentationSize(string $name): int
    {
        $uploadsDir = realpath($this->f3->get('UPLOADS'));
        if (false === $uploadsDir) {
            return 0;
        }
        $filePath = mb_rtrim($uploadsDir, '/\\') . '/' . basename($name);
        $size     = is_file($filePath) ? filesize($filePath) : 0;

        return false === $size ? 0 : $size;
    }
}
