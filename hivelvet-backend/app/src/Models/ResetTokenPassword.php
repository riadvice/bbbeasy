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

use DB\Cortex;
use Enum\CacheKey;
use Models\Base as BaseModel;

/**
 * Class User.
 *
 * @property int      $id
 * @property int      $user_id
 * @property string   $token
 * @property string   $status
 * @property datetime $expires_at
 */
class ResetTokenPassword extends BaseModel
{
    protected $table = 'reset_password_tokens';

    public function __construct($db = null, $table = null, $fluid = null, $ttl = 0)
    {
        parent::__construct($db, $table, $fluid, $ttl);
    }

    public function onCreateCleanUp(): void
    {
        $this->f3->clear(CacheKey::AJAX_USERS);
    }

    public function onUpdateCleanUp(): void
    {
        $this->f3->clear(CacheKey::AJAX_USERS);
    }

    /**
     * Check if USER id already in use.
     *
     * @param int $userID
     *
     * @return bool
     */
    public function userExists($userID)
    {
        return \count($this->db->exec('SELECT 1 FROM reset_password_tokens WHERE  user_id = ?', $userID)) > 0;
    }

    /**
     * Check if token already exists.
     *
     * @return bool
     */
    public function tokenExists(string $token)
    {
        return \count($this->db->exec('SELECT 1 FROM reset_password_tokens WHERE "token"= ?', $token)) > 0;
    }

    /**
     * Get user record by userID value.
     *
     * @return Cortex
     */
    public function getByUserID(int $userID)
    {
        $this->load(['user_id = ?', $userID]);

        return $this;
    }

    /**
     * Get user record by token value.
     *
     * @return Cortex
     */
    public function getByToken(string $token)
    {
        $this->load(['token = ?', $token]);

        return $this;
    }
}
