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

namespace Models;

use Models\Base as BaseModel;

/**
 * Class UserSession.
 *
 * @property int       $id
 * @property string    $session_id
 * @property string    $data
 * @property string    $ip
 * @property string    $agent
 * @property int       $stamp
 * @property \DateTime $expires
 */
class UserSession extends BaseModel
{
    protected $table = 'users_sessions';

    public function getSessionExpirationTime(string $sessionId): string
    {
        $result  = $this->db->exec('SELECT expires FROM users_sessions where session_id = :session', [':session' => $sessionId]);
        $expires = $result[0]['expires'];
        if (!$expires) {
            return date('c', time() + \ini_get('session.cookie_lifetime'));
        }

        return $expires;
    }
}
