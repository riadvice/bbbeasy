<?php

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

namespace Actions\Users;

use Actions\Base as BaseAction;
use Models\User;
use Models\UserSession;

class Session extends BaseAction
{
    public function execute($f3, $params)
    {
        $user    = new User();
        $user_id = $this->session->get('user.id');

        if (!$user_id) {
            $this->session->revokeUser();

            $this->f3->error(401);
        }

        $Infos = $user->getById($user_id);

        $userInfos = [
            'id'          => $Infos->id,
            'username'    => $Infos->username,
            'email'       => $Infos->email,
            'role'        => $Infos->role->name,
            'avatar'      => $Infos->avatar,
            'permissions' => $Infos->role->getRolePermissions(),
        ];
        $userSession  = new UserSession();
        $sessionInfos = [
            'PHPSESSID' => session_id(),
            'expires'   => $userSession->getSessionExpirationTime(session_id()),
        ];

        $this->renderJson(['user' => $userInfos, 'session' => $sessionInfos]);
    }
}
