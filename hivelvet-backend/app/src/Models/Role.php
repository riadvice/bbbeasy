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
use Enum\UserRole;
use Models\Base as BaseModel;

/**
 * Class Role.
 *
 * @property int      $id
 * @property string   $name
 * @property array    $permissions
 * @property array    $users
 * @property DateTime $created_on
 * @property DateTime $updated_on
 */
class Role extends BaseModel
{
    protected $fieldConf = [
        'permissions' => [
            'has-many' => [RolePermission::class, 'role_id'],
        ],
        'users' => [
            'has-many' => [User::class, 'role_id'],
        ],
    ];

    protected $table = 'roles';

    public function __construct($db = null, $table = null, $fluid = null, $ttl = 0)
    {
        parent::__construct($db, $table, $fluid, $ttl);
        $this->onset('name', fn($self, $value) => $self->f3->snakecase($value));
    }

    public function nameExists($name, $id = null)
    {
        return $this->load(['name = ? and id != ?', $name, $id]);
    }

    public function getAllRoles()
    {
        $data  = [];
        $roles = $this->find([], ['order' => 'id']);
        if ($roles) {
            foreach ($roles as $role) {
                $data[] = [
                    'key'         => $role->id,
                    'name'        => $role->name,
                    'users'       => $role->getRoleUsers(),
                    'permissions' => $role->getRolePermissions(),
                ];
            }
        }

        return $data;
    }

    public function collectAll(): array
    {
        return $this->db->exec('SELECT id, name FROM roles');
    }

    /**
     * @return array
     */
    public function getLecturerRole()
    {
        $data = [];
        $this->load(['name = ?', [UserRole::LECTURER]]);
        if ($this->valid()) {
            $data = [
                'key'         => $this->id,
                'name'        => $this->name,
                'users'       => $this->getRoleUsers(),
                'permissions' => $this->getRolePermissions(),
            ];
        }

        return $data;
    }

    public function getRoleUsers()
    {
        return $this->users ? \count($this->users) : 0;
    }

    public function getRolePermissions()
    {
        $rolePermissions = $this->permissions;

        if ($rolePermissions) {
            $permissionsRole = [];

            /** @var RolePermission $rolePermission */
            foreach ($rolePermissions as $rolePermission) {
                $permissionsRole[$rolePermission->group][] = $rolePermission->name;
            }
        } else {
            $permissionsRole = (object) [];
        }

        return $permissionsRole;
    }

    public function saveRoleAndPermissions($permissions)
    {
        $this->logger->info('Starting save role and permissions transaction.');
        $this->db->begin();
        $this->save();
        $this->logger->info('Role successfully added', ['role' => $this->toArray()]);

        if (isset($permissions)) {
            // add permissions
            foreach ($permissions as $group => $actions) {
                if (!empty($actions)) {
                    foreach ($actions as $action) {
                        $rolePermission          = new RolePermission();
                        $rolePermission->group   = $group;
                        $rolePermission->name    = $action;
                        $rolePermission->role_id = $this->id;

                        try {
                            $rolePermission->save();
                            $this->logger->info('Role permission successfully added', ['rolePermission' => $rolePermission->toArray()]);
                        } catch (\Exception $e) {
                            $this->logger->error('Role permission could not be added', ['error' => $e->getMessage()]);

                            return false;
                        }
                    }
                }
            }
        }

        $this->db->commit();
        $this->logger->info('Save role and permissions transaction successfully commit.');

        return true;
    }

    public function switchAllRoleUsers()
    {
        $role_id = $this->id;
        if (1 !== $role_id && 2 !== $role_id) {
            $users = $this->getRoleUsers();
            if ($users > 0) {
                /** @var User $user */
                foreach ($this->users as $user) {
                    $user->role_id = 2;

                    try {
                        $user->save();
                        $this->logger->info('User role successfully switched', ['user' => $user->toArray()]);
                    } catch (\Exception $e) {
                        $this->logger->error('User role could not be switched', ['error' => $e->getMessage()]);

                        return false;
                    }
                }
            }

            return true;
        }

        return false;
    }

    public function deleteAllRolePermissions()
    {
        $role_id = $this->id;
        if (1 !== $role_id) {
            $permissions = $this->getRolePermissions();
            if ('array' === \gettype($permissions)) {
                $rolePermission = new RolePermission();
                $deleteResult   = $rolePermission->erase(['role_id = ?', $role_id]);
                if ($deleteResult) {
                    $this->logger->info('All Role permissions successfully deleted');

                    return true;
                }

                return false;
            }

            return true;
        }

        return false;
    }

    public function deleteUsersAndPermissions()
    {
        $this->logger->info('Starting delete users and permissions transaction.');
        $this->db->begin();

        // switch users of this role to lecturer role
        $result1 = $this->switchAllRoleUsers();

        // delete permissions of this role
        $result2 = $this->deleteAllRolePermissions();

        if ($result1 && $result2) {
            $this->db->commit();
            $this->logger->info('Delete users and permissions transaction successfully commit.');

            return true;
        }

        return false;
    }
}
