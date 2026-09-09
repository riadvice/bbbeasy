<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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
                $dataChecker->verify($form['name'], Validator::length(1, 64)->setName('name'));

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
                try {
                    $role->syncPermissions($form['permissions']);
                } catch (\Exception $e) {
                    $this->logger->error('Role permissions could not be updated', ['error' => $e->getMessage()]);
                    $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
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
            $this->renderJson(['result' => 'success', 'role' => $role->getRoleInfos()]);
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
