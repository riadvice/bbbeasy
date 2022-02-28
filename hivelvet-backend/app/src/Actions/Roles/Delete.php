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

namespace Actions\Roles;

use Actions\Delete as DeleteAction;
use Enum\ResponseCode;
use Models\Role;

/**
 * Class Delete.
 */
class Delete extends DeleteAction
{

    public function execute($f3, $params): void
    {
        $role       = new Role();
        $role_id    = $params['id'];
        $nbUsers    = count($role->getRoleUsers($role_id));

        $resultCode1 = $role->switchAllRoleUser($role_id);
        $resultCode2 = $role->deleteRolePermissions($role_id);

        if ($resultCode1 == ResponseCode::HTTP_OK and $resultCode2 == ResponseCode::HTTP_OK) {
            parent::execute($f3,$params);
            if ($nbUsers > 0) {
                $result = $role->getAllRoles();
                $this->renderJson(json_encode($result));
            }
        }
    }
}
