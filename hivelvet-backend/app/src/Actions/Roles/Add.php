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
use Models\User;
use Models\UserRole;
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
        $body = $this->getDecodedBody();
        $form = $body['data'];
        $v    = new DataChecker();

        $v->verify($form['name'], Validator::notEmpty()->setName('name'));

        if ($v->allValid()) {
            $role = new Role();
            $name = strtolower($form['name']);
            $name = str_replace(' ', '_', $name);
            $nameExist = $role->load(['name = ?', $name]);
            if ($nameExist) {
                $error = 'Name already exist';
                $this->logger->error('role could not be added', ['error' => $error]);
                $this->renderJson(['errors' => ['name' => $error]], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
            }
            else {
                $role->name = $name;

                try {
                    $role->save();
                    $this->logger->info('role successfully added', ['role' => $role->toArray()]);

                    // assign users
                    $users = $form['users'];
                    if (!empty($users)) {
                        foreach ($users as $user_id) {
                            $user = new User();
                            $user = $user->getById($user_id);
                            if ($user->valid()) {
                                $userRole = new UserRole();
                                $userRole->user_id = $user->id;
                                $userRole->role_id = $role->id;
                                try {
                                    $userRole->save();
                                    $this->logger->info('userRole successfully added', ['userRole' => $userRole->toArray()]);
                                }
                                catch (\Exception $e) {
                                    $this->logger->error('user role could not be added', ['error' => $e->getMessage()]);
                                    $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                                    return;
                                }
                            }
                        }
                    }

                    //assign permissions
                    $permissions = $form['permissions'];
                    if (!empty($permissions)) {
                        foreach ($permissions as $permission) {
                            $privilegeInfos = explode('__', $permission);
                            $name = $privilegeInfos[0];
                            $group = $privilegeInfos[1];
                            $rolePermission = new RolePermission();
                            $rolePermission->group      = $group;
                            $rolePermission->name       = $name;
                            $rolePermission->role_id    = $role->id;
                            try {
                                $rolePermission->save();
                                $this->logger->info('rolePermission successfully added', ['rolePermission' => $rolePermission->toArray()]);
                            }
                            catch (\Exception $e) {
                                $this->logger->error('role permission could not be added', ['error' => $e->getMessage()]);
                                $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                                return;
                            }
                        }
                    }
                }
                catch (\Exception $e) {
                    $this->logger->error('role could not be added', ['error' => $e->getMessage()]);
                    $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
                }

                $result = [
                    'key'           => $role->id,
                    'name'          => $role->name,
                    'users'         => $role->getRoleUsers($role->id),
                    'permissions'   => $role->getRolePermissions($role->id)
                ];
                $this->renderJson(['result' => 'success','role' => $result]);
            }
        }
        else {
            $this->renderJson(['errors' => $v->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
