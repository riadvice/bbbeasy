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
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Add.
 */
class Add extends BaseAction
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

        $dataChecker = new DataChecker();

        $dataChecker->verify($form['name'], Validator::notEmpty()->setName('name'));

        $errorMessage = 'Role could not be added';
        if ($dataChecker->allValid()) {
            $checkRole  = new Role();
            $role       = new Role();
            $role->name = $form['name'];
            if ($checkRole->nameExists($role->name)) {
                $this->logger->error($errorMessage, ['error' => 'Name already exists']);
                $this->renderJson(['errors' => ['name' => 'Name already exists']], ResponseCode::HTTP_PRECONDITION_FAILED);
            } else {
                try {
                    $result = $role->saveRoleAndPermissions($form['name'], $form['permissions']);
                    if (!$result) {
                        $this->renderJson(['errors' => $errorMessage], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        return;
                    }
                } catch (\Exception $e) {
                    $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
                    $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                    return;
                }
                $this->renderJson(['result' => 'success', 'role' => $role->getRoleInfos($result)], ResponseCode::HTTP_CREATED);
            }
        } else {
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
