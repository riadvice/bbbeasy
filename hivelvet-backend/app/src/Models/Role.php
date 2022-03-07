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
 * @property array    $permissions
 * @property array    $users
 */
class Role extends BaseModel
{
    protected $fieldConf = [
        'permissions' => [
            'has-many' => [RolePermission::class, 'role_id']
        ],
        'users' => [
            'has-many' => [UserRole::class, 'role_id']
        ],
    ];

    protected $table = 'roles';

    public function nameExists($name, $id = null)
    {
        return $this->load(['name = ? and id != ?', $name, $id]);
    }

    public function getAllRoles()
    {
        $data   = [];
        $roles  = $this->find([], ['order' => 'id']);
        if ($roles) {
            foreach ($roles as $role) {
                $data[] = [
                    'key'           => $role->id,
                    'name'          => $role->name,
                    'users'         => $role->getRoleUsers(),
                    'permissions'   => $role->getRolePermissions()
                ];
            }
        }
        return [
            'data' => $data
        ];
    }

    public function getLecturerRole()
    {
        $data   = [];
        $this->load(['id = ?', [2]]);
        if ($this->valid()) {
            $data = [
                'key'           => $this->id,
                'name'          => $this->name,
                'users'         => $this->getRoleUsers(),
                'permissions'   => $this->getRolePermissions()
            ];
        }
        return $data;
    }

    public function getRoleUsers()
    {
        return $this->users ? count($this->users) : 0;
    }

    public function getRolePermissions()
    {
        $rolePermissions = $this->permissions;

        if ($rolePermissions) {
            $permissionsRole = [];
            /**
             * @var $rolePermission RolePermission
             */
            foreach ($rolePermissions as $rolePermission) {
                $permissionsRole[$rolePermission->group][] = $rolePermission->name;
            }
        }
        else {
            $permissionsRole = (object)[];
        }
        return $permissionsRole;
    }

    public function saveRoleAndPermissions($permissions)
    {
        $this->logger->info('Starting save role and permissions transaction.');
        $this->db->begin();
        $this->save();
        $this->logger->info('role successfully added', ['role' => $this->toArray()]);

        if (isset($permissions)) {
            //add permissions
            foreach ($permissions as $group => $actions) {
                if (!empty($actions)) {
                    foreach ($actions as $action) {
                        $rolePermission = new RolePermission();
                        $rolePermission->group      = $group;
                        $rolePermission->name       = $action;
                        $rolePermission->role_id    = $this->id;
                        try {
                            $rolePermission->save();
                            $this->logger->info('Role permission successfully added', ['rolePermission' => $rolePermission->toArray()]);
                        }
                        catch (\Exception $e) {
                            $this->logger->error('Role permission could not be added', ['error' => $e->getMessage()]);
                            return $e;
                        }
                    }
                }
            }
        }

        $this->db->commit();
        $this->logger->info('Save role and permissions transaction successfully commit.');

        return ResponseCode::HTTP_OK;
    }

    public function switchAllRoleUsers()
    {
        $role_id = $this->id;

        if ($role_id != 1 and $role_id != 2) {
            $users = $this->getRoleUsers();
            if ($users > 0) {
                $userRole = new UserRole();
                $usersRole  = $userRole->find(['role_id = ?',$role_id], ['order' => 'id']);
                foreach ($usersRole as $userRole) {
                    $defaultRoleUser   = new UserRole();
                    //if user have already role lecturer => delete user role
                    $defaultRoleUser->load(['role_id = ? and user_id = ?', 2, $userRole->user_id]);
                    if ($defaultRoleUser->valid()) {
                        $deleteResult   = $userRole->erase();
                        $resultCode     = $deleteResult ? ResponseCode::HTTP_OK : ResponseCode::HTTP_INTERNAL_SERVER_ERROR;
                        if ($resultCode == ResponseCode::HTTP_OK) {
                            $this->logger->info('User role successfully deleted');
                        }
                    }
                    //else switch user role to role lecturer
                    else {
                        $userRole->role_id      = 2;
                        $userRole->updated_on   = date('Y-m-d H:i:s');
                        try {
                            $userRole->save();
                            $this->logger->info('User role successfully switched', ['userRole' => $userRole->toArray()]);
                            $resultCode = ResponseCode::HTTP_OK;
                        }
                        catch (\Exception $e) {
                            $this->logger->error('User role could not be switched', ['error' => $e->getMessage()]);
                            $resultCode = ResponseCode::HTTP_INTERNAL_SERVER_ERROR;
                        }
                    }
                }
            }
            else {
                $resultCode = ResponseCode::HTTP_OK;
            }
        }
        else {
            $resultCode = ResponseCode::HTTP_INTERNAL_SERVER_ERROR;
        }

        return $resultCode;
    }

    public function deleteAllRolePermissions()
    {
        $role_id = $this->id;

        if ($role_id != 1) {
            $permissions = $this->getRolePermissions();
            if (gettype($permissions) == 'array') {
                $rolePermission  = new RolePermission();
                $deleteResult = $rolePermission->erase(['role_id = ?', $role_id]);
                $resultCode = $deleteResult ? ResponseCode::HTTP_OK : ResponseCode::HTTP_INTERNAL_SERVER_ERROR;
                if ($resultCode == ResponseCode::HTTP_OK) {
                    $this->logger->info('All Role permissions successfully deleted');
                }
            }
            else {
                $resultCode = ResponseCode::HTTP_OK;
            }
        }
        else {
            $resultCode = ResponseCode::HTTP_INTERNAL_SERVER_ERROR;
        }

        return $resultCode;
    }

    public function deleteUsersAndPermissions($role_id)
    {
        $this->load(['id = ?', [$role_id]]);
        $this->logger->info('Starting delete users and permissions transaction.');
        $this->db->begin();

        // switch users of this role to lecturer role
        $resultCode1 = $this->switchAllRoleUsers();

        // delete permissions of this role
        $resultCode2 = $this->deleteAllRolePermissions();

        if ($resultCode1 == ResponseCode::HTTP_OK and $resultCode2 == ResponseCode::HTTP_OK) {
            $this->db->commit();
            $this->logger->info('Delete users  and permissions transaction successfully commit.');
            return ResponseCode::HTTP_OK;
        }
    }

}
