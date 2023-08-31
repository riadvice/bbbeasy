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

use Enum\ResetTokenStatus;
use Helpers\Time;
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
class ResetPasswordToken extends BaseModel
{
    protected $table = 'reset_password_tokens';

    public function __construct($db = null, $table = null, $fluid = null, $ttl = 0)
    {
        parent::__construct($db, $table, $fluid, $ttl);
        $this->beforeinsert(function(self $self): void {
            $self->setCreatedOnDate();
            $this->token      = bin2hex(random_bytes(16));
            $this->expires_at = date('Y-m-d H:i:s', strtotime('+15 min'));
            $this->status     = ResetTokenStatus::NEW;
        });
    }

    /**
     * Check if the user has a reset token password.
     */
    public function userExists(int $userId): bool
    {
        return $this->load(['user_id = ?', $userId]);
    }

    /**
     * @return $this
     */
    public function getByToken(string $token): self
    {
        $this->load(['token = ?', $token]);

        return $this;
    }

    /**
     * Returns true if the token can be used.
     */
    public function isUsable(): bool
    {
        $status = ResetTokenStatus::NEW;

        return ResetTokenStatus::NEW === $status && !Time::isInPast(date('Y-m-d H:i:s', strtotime('+15 min')));
    }
}
