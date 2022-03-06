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

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Models\Role;
use Models\RolePermission;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Add.
 */
class Add extends BaseAction
{
    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body        = $this->getDecodedBody();
        $form        = $body['data'];
        $dataChecker = new DataChecker();

        $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));

        if ($dataChecker->allValid()) {
            $role = new Role();
            $name = str_replace(' ', '_', mb_strtolower($form['name']));
            $role->load(['name = ?', $name]);
            if (!$role->dry()) {
                $this->logger->error('Role could not be added', ['error' => 'Name already exist']);
                $this->renderJson(['errors' => ['name' => 'Name already exist']], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
            } else {
                $role->name = $name;

                try {
                    $role->save();
                    $this->logger->info('role successfully added', ['role' => $role->toArray()]);

                    //add permissions
                    if (isset($form['permissions'])) {
                        $permissions = $form['permissions'];
                        foreach ($permissions as $group => $actions) {
                            if (!empty($actions)) {
                                foreach ($actions as $action) {
                                    $rolePermission          = new RolePermission();
                                    $rolePermission->group   = $group;
                                    $rolePermission->name    = $action;
                                    $rolePermission->role_id = $role->id;

                                    try {
                                        $rolePermission->save();
                                        $this->logger->info('Role permission successfully added', ['rolePermission' => $rolePermission->toArray()]);
                                    } catch (\Exception $e) {
                                        $this->logger->error('Role permission could not be added', ['error' => $e->getMessage()]);
                                        $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                                        return;
                                    }
                                }
                            }
                        }
                    }
                } catch (\Exception $e) {
                    $this->logger->error('role could not be added', ['error' => $e->getMessage()]);
                    $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
                }

                $result = [
                    'key'         => $role->id,
                    'name'        => $role->name,
                    'users'       => $role->getRoleUsers($role->id),
                    'permissions' => $role->getRolePermissions($role->id),
                ];
                $this->renderJson(['result' => 'success', 'role' => $result]);
            }
        } else {
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
