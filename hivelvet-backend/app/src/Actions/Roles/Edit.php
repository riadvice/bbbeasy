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
use Validation\DataChecker;

/**
 * Class Edit.
 */
class Edit extends BaseAction
{
    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body = $this->getDecodedBody();
        $form = $body['data'];

        $role_id = $params['id'];
        $role    = $this->loadData($role_id);

        if (!$role->valid()) {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
        else {
            if (isset($form['name'])) {
                $v  = new DataChecker();
                $v->notEmpty()->verify('name', $form['name'], ['notEmpty' => 'Name is required']);
                if ($v->allValid()) {
                    $checkRole = new Role();
                    $name = strtolower($form['name']);
                    $name = str_replace(' ', '_', $name);
                    $nameExist = $checkRole->load(['name = ? and id != ?', $name,$role->id]);
                    if ($nameExist) {
                        $message = 'Name already exist';
                        $this->logger->error('role could not be updated', ['error' => $message]);
                        $this->renderJson(['errors' => ['name'=>$message]], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                        return;
                    }
                    else {
                        $role->name         = $name;
                        $role->updated_on   = date('Y-m-d H:i:s');
                    }
                }
                else {
                    $this->renderJson(['errors' => $v->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
                    return;
                }
            }
            if (isset($form['users']) and isset($form['permissions'])) {
                // assign users
                $newUsers = $form['users'];
                $oldUsers = $role->getRoleUsers($role_id);
                if ($newUsers != $oldUsers) {
                    foreach ($oldUsers as $oldUser) {
                        if (!in_array($oldUser,$newUsers)) {
                            // switch user to role lecturer or delete role user
                            $role->switchRoleUser($role_id,$oldUser);
                        }
                    }
                    if (!empty($newUsers)) {
                        foreach ($newUsers as $newUser) {
                            if (!in_array($newUser, $oldUsers)) {
                                // assign user to role
                                $user = new User();
                                $user = $user->getById($newUser);
                                if ($user->valid()) {
                                    $userRole           = new UserRole();
                                    $userRole->user_id  = $newUser;
                                    $userRole->role_id  = $role->id;
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
                    }
                }

                // assign permissions
                $newPermissions = $form['permissions'];
                $oldPermissions = $role->getRolePermissions($role_id);
                if ($newPermissions != $oldPermissions) {
                    foreach ($oldPermissions as $oldPermission) {
                        if (!in_array($oldPermission,$newPermissions)) {
                            // delete role permission
                            $rolePermission = new RolePermission();
                            $permissionInfos = explode('__', $oldPermission);
                            $rolePermission->load(['role_id = ? and group = ? and name = ?', $role_id, $permissionInfos[1], $permissionInfos[0]]);
                            $deleteResult = $rolePermission->erase();
                            if ($deleteResult) {
                                $this->logger->info('Role permission successfully deleted');
                            }
                            else {
                                $this->logger->critical('Error occurred while deleting role permission', ['rolePermission' => $rolePermission->toArray()]);
                                $this->renderJson([], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                            }
                        }
                    }
                    if (!empty($newPermissions)) {
                        foreach ($newPermissions as $newPermission) {
                            if (!in_array($newPermission, $oldPermissions)) {
                                // assign permission to role
                                $permissionInfos = explode('__', $newPermission);
                                $rolePermission = new RolePermission();
                                $rolePermission->group      = $permissionInfos[1];
                                $rolePermission->name       = $permissionInfos[0];
                                $rolePermission->role_id    = $role_id;
                                try {
                                    $rolePermission->save();
                                    $this->logger->info('role permission successfully added', ['rolePermission' => $rolePermission->toArray()]);
                                }
                                catch (\Exception $e) {
                                    $this->logger->error('role permission could not be added', ['error' => $e->getMessage()]);
                                    $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                                    return;
                                }
                            }
                        }
                    }
                }

                $role->updated_on = date('Y-m-d H:i:s');
            }

            try {
                $role->save();
            }
            catch (\Exception $e) {
                $this->logger->error('role could not be updated', ['error' => $e->getMessage()]);
                $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }

            $this->logger->info('role successfully updated', ['role' => $role->toArray()]);
            $result = [
                'key'           => $role->id,
                'name'          => $role->name,
                'users'         => $role->getRoleUsers($role_id),
                'permissions'   => $role->getRolePermissions($role_id)
            ];
            $this->renderJson(['result' => 'success','role' => $result]);
        }
    }

    /**
     * @param int $id
     */
    public function loadData($id): Role
    {
        $role = new Role();
        $role->load(['id = ?', [$id]]);

        return $role;
    }
}
