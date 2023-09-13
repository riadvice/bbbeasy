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

namespace Actions\Roles;

use Actions\Delete as DeleteAction;
use Actions\RequirePrivilegeTrait;

/**
 * Class Delete.
 */
class Delete extends DeleteAction
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
             
            if(!is_array($permissions)||!isset($permissions['roles'])){
                $this->logger->warning('Access denied to route ');
                $this->f3->error(401);
            }
           
        }
    }
    protected $deleteMethodName = 'delete';
}
