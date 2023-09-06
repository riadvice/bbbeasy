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

namespace Actions\Users;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Role;
use Models\User;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Add.
 */
class Add extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body        = $this->getDecodedBody();
        $form        = $body['data'];
        $dataChecker = new DataChecker();

        $username = $form['username'];
        $email    = $form['email'];
        $password = $form['password'];
        $roleId   = $form['role'];

        $dataChecker->verify($username, Validator::length(4)->setName('username'));
        $dataChecker->verify($email, Validator::email()->setName('email'));
        $dataChecker->verify($password, Validator::length(8)->setName('password'));
        $dataChecker->verify($roleId, Validator::notEmpty()->setName('role'));

        /** @todo : move to locales */
        $errorMessage   = 'User could not be added';
        $successMessage = 'User successfully added';
        if ($dataChecker->allValid()) {
            if ($this->credentialsAreValid($username, $email, $password, $errorMessage)) {
                $role = new Role();
                $role->load(['id = ?', [$roleId]]);
                if ($role->valid()) {
                    $user   = new User();
                    $result = $user->saveUserWithDefaultPreset($username, $email, $password, $role->id, $successMessage, $errorMessage);
                    if ($result) {
                        $this->renderJson(['result' => 'success', 'user' => $user->getUserInfos()], ResponseCode::HTTP_CREATED);
                    } else {
                        $this->renderJson(['message' => $errorMessage], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                    }
                } else {
                    $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
                }
            }
        } else {
            $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
