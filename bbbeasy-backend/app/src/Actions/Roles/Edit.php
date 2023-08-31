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

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Role;
use Models\RolePermission;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Edit.
 */
class Edit extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param mixed $f3
     * @param mixed $params
     *
     * @throws \JsonException
     */
    public function save($f3, $params): void
    {
        $body = $this->getDecodedBody();
        $form = $body['data'];

        $roleId = $params['id'];
        $role   = $this->loadData($roleId);

        $errorMessage = 'Role could not be updated';

        if ($role->valid()) {
            if (isset($form['name'])) {
                $dataChecker = new DataChecker();
                $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));

                if ($dataChecker->allValid()) {
                    $checkRole  = new Role();
                    $role->name = $form['name'];

                    if ($checkRole->nameExists($role->name, $role->id)) {
                        $this->logger->error('Role could not be updated', ['error' => 'Name already exists']);
                        $this->renderJson(['errors' => ['name' => 'Name already exists']], ResponseCode::HTTP_PRECONDITION_FAILED);

                        return;
                    }
                } else {
                    $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
                    $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);

                    return;
                }
            }
            if (isset($form['permissions'])) {
                // edit permissions
                $newPermissions = $form['permissions'];
                $oldPermissions = $role->getRolePermissions();
                foreach ($newPermissions as $group => $actions) {
                    // check if role have permissions assigned and group exist
                    if (\is_array($oldPermissions) && $oldPermissions[$group]) {
                        // delete or add new actions of this group
                        $deletedActions = array_diff($oldPermissions[$group], $actions);
                        $addedActions   = array_diff($actions, $oldPermissions[$group]);
                        if (!empty($deletedActions)) {
                            // delete role permissions
                            foreach ($deletedActions as $deletedAction) {
                                $rolePermission = new RolePermission();
                                $rolePermission->load(['role_id = ? and group = ? and name = ?', $roleId, $group, $deletedAction]);
                                $deleteResult = $rolePermission->erase();
                                if ($deleteResult) {
                                    $this->logger->info('Role permission successfully deleted');
                                } else {
                                    $this->logger->critical('Error occurred while deleting role permission', ['rolePermission' => $rolePermission->toArray()]);
                                    $this->renderJson([], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                                }
                            }
                        }
                        if (!empty($addedActions)) {
                            // add role permissions
                            foreach ($addedActions as $addedAction) {
                                $rolePermission          = new RolePermission();
                                $rolePermission->group   = $group;
                                $rolePermission->name    = $addedAction;
                                $rolePermission->role_id = $roleId;

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
                    // permissions role is empty or a new group of permissions
                    else {
                        if (!empty($actions)) {
                            // new role permissions
                            foreach ($actions as $newAction) {
                                $rolePermission          = new RolePermission();
                                $rolePermission->group   = $group;
                                $rolePermission->name    = $newAction;
                                $rolePermission->role_id = $roleId;

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
            }

            try {
                $role->save();
            } catch (\Exception $e) {
                $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
                $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }

            $role = $this->loadData($roleId);
            $this->logger->info('Role successfully updated', ['role' => $role->toArray()]);
            $this->renderJson(['result' => 'success', 'role' => $role->getRoleInfos($role)]);
        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
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
