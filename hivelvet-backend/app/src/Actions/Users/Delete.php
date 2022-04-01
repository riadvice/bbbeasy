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

namespace Actions\Users;

use Actions\Delete as DeleteAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Enum\UserStatus;
use Models\User;

/**
 * Class Delete.
 */
class Delete extends DeleteAction
{
    use RequirePrivilegeTrait;

    public function execute($f3, $params): void
    {
        $user    = new User();
        $user_id = $params['id'];
        $user->load(['id = ?', $user_id]);
        if ($user->valid()) {
            $user->status = UserStatus::DELETED;

            try {
                $user->save();
            } catch (\Exception $e) {
                $message = 'user could not be deleted';
                $this->logger->error('User could not be deleted', ['user' => $user->toArray(), 'error' => $e->getMessage()]);
                $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }
            $this->logger->info('User successfully deleted', ['user' => $user->toArray()]);
            $this->renderJson(['result' => 'success', 'user' => $user->getUserInfos($user->id)]);
        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
