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

namespace Models;

use Models\Base as BaseModel;

/**
 * Class ResetTokenPassword.
 *
 * @property int       $id
 * @property int       $user_id
 * @property string    $token
 * @property string    $status
 * @property \DateTime $expires_at
 */
class ResetTokenPassword extends BaseModel
{
    protected $table = 'reset_password_tokens';

    public function __construct($db = null, $table = null, $fluid = null, $ttl = 0)
    {
        parent::__construct($db, $table, $fluid, $ttl);
        $this->token = bin2hex(random_bytes(16));
    }

    /**
     * Check if the user has a reset token password.
     *
     * @param int $userID
     */
    public function userExists($userID): bool
    {
        return $this->load(['user_id= ?', $userID]);
    }

    /**
     * Check if token already exists.
     */
    public function tokenExists(string $token): bool
    {
        return $this->load(['token = ?', $token]);
    }
}
