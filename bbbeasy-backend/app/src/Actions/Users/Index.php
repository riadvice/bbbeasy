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

namespace Actions\Users;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\UserStatus;
use Models\User;

/**
 * Class Index.
 */
class Index extends BaseAction
{
    use RequirePrivilegeTrait;
    public function beforeroute(): void
    {
        if ( null === $this->session->get('user')) {
            $this->logger->warning('Access denied to route ');
            $this->f3->error(401);
        }
        else{
            $user  = new User();
            $user_id   = $this->session->get('user.id');
         
            $Infos=$user->getById($user_id);
           
            $permissions =  $Infos->role->getRolePermissions();
             
            if(!is_array($permissions)||!isset($permissions['users'])){
                $this->logger->warning('Access denied to route ');
                $this->f3->error(401);
            }
           
        }
    }
    /**
     * @param \Base $f3
     * @param array $params
     */
    public function show($f3, $params): void
    {
        $user  = new User();
        $users = $user->getAllUsers();

        $userStatus = new UserStatus();
        $states     = $userStatus::values();

        $this->logger->debug('collecting users', ['users' => json_encode($users)]);
        $this->renderJson(['users' => $users, 'states' => $states]);
    }
   
}
