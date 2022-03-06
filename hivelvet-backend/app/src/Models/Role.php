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

namespace Models;

use DateTime;
use Enum\ResponseCode;
use Models\Base as BaseModel;

/**
 * Class Role.
 *
 * @property int      $id
 * @property string   $name
 * @property DateTime $created_on
 * @property DateTime $updated_on
 */
class Role extends BaseModel
{
    protected $table = 'roles';

    public function getAllRoles()
    {
        $data  = [];
        $roles = $this->find([], ['order' => 'id']);
        if ($roles) {
            foreach ($roles as $role) {
                $data[] = [
                    'key'         => $role->id,
                    'name'        => $role->name,
                    'users'       => $role->getRoleUsers($role->id),
                    'permissions' => $role->getRolePermissions($role->id),
                ];
            }
        }

        return [
            'data' => $data,
        ];
    }

    public function getLecturerRole()
    {
        $data = [];
        $this->load(['id = ?', [2]]);
        if ($this->valid()) {
            $data = [
                'key'         => $this->id,
                'name'        => $this->name,
                'users'       => $this->getRoleUsers($this->id),
                'permissions' => $this->getRolePermissions($this->id),
            ];
        }

        return $data;
    }

    public function getRoleUsers($id)
    {
        $userRole  = new UserRole();
        $usersRole = $userRole->find(['role_id = ?', $id], ['order' => 'id']);

        return $usersRole ? $usersRole->count() : 0;
    }

    public function getRolePermissions($id)
    {
        $rolePermission  = new RolePermission();
        $rolePermissions = $rolePermission->find(['role_id = ?', $id], ['order' => 'id']);

        if ($rolePermissions) {
            $permissionsRole = [];
            foreach ($rolePermissions as $rolePermission) {
                $permissionsRole[$rolePermission->group][] = $rolePermission->name;
            }
        } else {
            $permissionsRole = (object) [];
        }

        return $permissionsRole;
    }

    public function switchAllRoleUsers($role_id)
    {
        $users = $this->getRoleUsers($role_id);
        if (1 !== $role_id && 2 !== $role_id) {
            if ($users > 0) {
                $userRole  = new UserRole();
                $usersRole = $userRole->find(['role_id = ?', $role_id], ['order' => 'id']);
                foreach ($usersRole as $userRole) {
                    $defaultRoleUser = new UserRole();
                    //if user have already role lecturer => delete user role
                    $defaultRoleUser->load(['role_id = ? and user_id = ?', 2, $userRole->user_id]);
                    if ($defaultRoleUser->valid()) {
                        $deleteResult = $userRole->erase();
                        $resultCode   = $deleteResult ? ResponseCode::HTTP_OK : ResponseCode::HTTP_INTERNAL_SERVER_ERROR;
                        if (ResponseCode::HTTP_OK === $resultCode) {
                            $this->logger->info('User role successfully deleted');
                        }
                    }
                    //else switch user role to role lecturer
                    else {
                        $userRole->role_id = 2;

                        try {
                            $userRole->save();
                            $this->logger->info('User role successfully switched', ['userRole' => $userRole->toArray()]);
                            $resultCode = ResponseCode::HTTP_OK;
                        } catch (\Exception $e) {
                            $this->logger->error('User role could not be switched', ['error' => $e->getMessage()]);
                            $resultCode = ResponseCode::HTTP_INTERNAL_SERVER_ERROR;
                        }
                    }
                }
            } else {
                $resultCode = ResponseCode::HTTP_OK;
            }
        } else {
            $resultCode = ResponseCode::HTTP_INTERNAL_SERVER_ERROR;
        }

        return $resultCode;
    }

    public function deleteAllRolePermissions($role_id)
    {
        if (1 !== $role_id) {
            $permissions = $this->getRolePermissions($role_id);
            if ('array' === \gettype($permissions)) {
                $rolePermission  = new RolePermission();
                $rolePermissions = $rolePermission->find(['role_id = ?', $role_id]);
                foreach ($rolePermissions as $rolePermission) {
                    $deleteResult = $rolePermission->erase();
                    $resultCode   = $deleteResult ? ResponseCode::HTTP_OK : ResponseCode::HTTP_INTERNAL_SERVER_ERROR;
                    if (ResponseCode::HTTP_OK === $resultCode) {
                        $this->logger->info('Role permission successfully deleted');
                    }
                }
            } else {
                $resultCode = ResponseCode::HTTP_OK;
            }
        } else {
            $resultCode = ResponseCode::HTTP_INTERNAL_SERVER_ERROR;
        }

        return $resultCode;
    }
}
