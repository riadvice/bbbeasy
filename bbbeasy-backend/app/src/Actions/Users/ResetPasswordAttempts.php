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

namespace Actions\Users;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Enum\UserStatus;
use Models\User;

/**
 * Class ResetPasswordAttempts.
 */
class ResetPasswordAttempts extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $userId       = $params['id'];
        $user         = new User()->getById($userId);
        $errorMessage = 'Password attempts could not be reset';

        if (!$user->valid()) {
            $this->logger->error($errorMessage, ['user' => $userId, 'error' => 'user not found']);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);

            return;
        }

        // A deleted account is not unlocked, it is reactivated through its own flow.
        if (UserStatus::DELETED === $user->status) {
            $this->logger->error($errorMessage, ['user' => $userId, 'error' => 'user is deleted']);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);

            return;
        }

        try {
            $user->unlock();
        } catch (\Exception $e) {
            $this->logger->error($errorMessage, ['user' => $userId, 'error' => $e->getMessage()]);
            $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

            return;
        }

        $this->logger->info('Password attempts successfully reset', ['user' => $userId]);
        $this->renderJson(['result' => 'success', 'user' => $user->getUserInfos()]);
    }
}
