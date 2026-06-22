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

namespace Models;

use Enum\ResponseCode;
use Enum\UserRole;
use Models\Base as BaseModel;

/**
 * Class Role.
 *
 * @property int       $id
 * @property string    $name
 * @property array     $permissions
 * @property array     $users
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
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
    }

    public function nameExists($name, $id = null): bool
    {
        return $this->load(['lower(name) = ? and id != ?', mb_strtolower($this->f3->snakecase($name)), $id]);
    }

    public function getAllRoles(): array
    {
        $data  = [];
        $roles = $this->find([], ['order' => 'id']);
        if ($roles) {
            foreach ($roles as $role) {
                $data[] = $role->getRoleInfos($role);
            }
        }

        return $data;
    }

    public function collectAll(): array
    {
        return $this->db->exec('SELECT id, name FROM roles');
    }

    public function getRoleInfos($role): array
    {
        return [
            'key'         => $role->id,
            'name'        => $role->name,
            'users'       => $this->getRoleUsers(),
            'permissions' => $this->getRolePermissions(),
        ];
    }

    public function getRoleByName($name)
    {
        $this->load(['name = ? ', $name]);

        return $this;
    }

    public function getIdRoleByName($name): array
    {
        $id = $this->db->exec('SELECT id FROM roles where name= ?', $name);

        return $id[0];
    }

    public function getLecturerRole(): array
    {
        $data = [];
        $this->load(['id = ?', [UserRole::LECTURER_ID]]);
        if ($this->valid()) {
            $data = $this->getRoleInfos($this);
        }

        return $data;
    }

    public function getAdministratorRole(): array
    {
        $data = [];
        $this->load(['id = ?', [UserRole::ADMINISTRATOR_ID]]);
        if ($this->valid()) {
            $data = $this->getRoleInfos($this);
        }

        return $data;
    }

    public function getRoleUsers(): int
    {
        return $this->users ? \count($this->users) : 0;
    }

    public function getRolePermissions(): array|object
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

    public function saveRoleAndPermissions($name, $permissions): bool|self
    {
        $this->logger->info('Starting save role and permissions transaction.');
        $this->db->begin();
        $this->save();
        $this->logger->info('Role successfully added', ['role' => $this->toArray()]);
        $this->db->commit();
        $roleId = $this->getIdRoleByName($name);

        $this->db->begin();
        if (isset($permissions)) {
            // add permissions
            foreach ($permissions as $group => $actions) {
                if (!empty($actions)) {
                    foreach ($actions as $action) {
                        $rolePermission          = new RolePermission();
                        $rolePermission->group   = $group;
                        $rolePermission->name    = $action;
                        $rolePermission->role_id = $roleId['id'];

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

        return $this->getRoleByName($name);
    }

    public function switchAllRoleUsers(): bool
    {
        $roleId = $this->id;
        if (UserRole::ADMINISTRATOR_ID !== $roleId && UserRole::LECTURER_ID !== $roleId) {
            $users = $this->getRoleUsers();

            if ($users > 0) {
                /** @var User $user */
                foreach ($this->users as $user) {
                    $user->role_id = UserRole::LECTURER_ID;

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

    public function deleteAllRolePermissions(): bool
    {
        $roleId = $this->id;
        if (1 !== $roleId) {
            $permissions = $this->getRolePermissions();
            if ('array' === \gettype($permissions)) {
                $rolePermission = new RolePermission();
                $deleteResult   = $rolePermission->erase(['role_id = ?', $roleId]);
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

    public function deleteUsersAndPermissions(): bool
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

    /**
     * Delete a role if it's allowed and switch their users to the Lecturer role and removing its associated permissions.
     *
     * @return Array[2](Array[], ResponsCode)
     */
    public function delete(): array
    {
        $nbUsers = $this->getRoleUsers();

        // delete users and permissions
        $result = $this->deleteUsersAndPermissions();

        if ($result) {
            try {
                $this->erase();
                $this->logger->info('Role successfully deleted', ['role' => $this->toArray()]);
            } catch (\Exception $e) {
                $this->logger->error('Role could not be deleted', ['role' => $this->toArray(), 'error' => $e->getMessage()]);

                throw $e;
            }

            if ($nbUsers > 0) {
                $result = $this->getLecturerRole();

                return [['lecturer' => $result], ResponseCode::HTTP_OK];
            }

            return [['result' => 'success'], ResponseCode::HTTP_OK];
        }

        return [[], ResponseCode::HTTP_FORBIDDEN];
    }
}
