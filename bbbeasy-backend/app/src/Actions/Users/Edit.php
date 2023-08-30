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
 * Class Edit.
 */
class Edit extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body = $this->getDecodedBody();
        $form = $body['data'];

        $id   = $params['id'];
        $user = $this->loadData($id);

        $usernameErrorMessage = 'Username already exists';
        $emailErrorMessage    = 'Email already exists';
        $errorMessage         = 'User could not be updated';
        if ($user->valid()) {
            $dataChecker = new DataChecker();

            $username = $form['username'];
            $email    = $form['email'];
            $roleId   = $form['role'];
            $status   = $form['status'];

            $dataChecker->verify($username, Validator::length(4)->setName('username'));
            $dataChecker->verify($email, Validator::email()->setName('email'));
            $dataChecker->verify($roleId, Validator::notEmpty()->setName('role'));
            $dataChecker->verify($status, Validator::notEmpty()->setName('status'));

            if ($dataChecker->allValid()) {
                $checkUser = new User();

                $usernameExist = $checkUser->usernameExists($username, $id);
                $emailExist    = $checkUser->emailExists($email, $id);

                if ($usernameExist || $emailExist) {
                    if ($usernameExist && $emailExist) {
                        $message = ['username' => $usernameErrorMessage, 'email' => $emailErrorMessage];
                    } elseif ($usernameExist) {
                        $message = ['username' => $usernameErrorMessage];
                    } else {
                        $message = ['email' => $emailErrorMessage];
                    }
                    $this->logger->error($errorMessage, ['errors' => $message]);
                    $this->renderJson(['errors' => $message], ResponseCode::HTTP_PRECONDITION_FAILED);

                    return;
                }
                $role = new Role();
                $role->load(['id = ?', [$roleId]]);
                if ($role->valid()) {
                    $user->email    = $email;
                    $user->username = $username;
                    $user->status   = $status;
                    $user->role_id  = $role->id;

                    try {
                        $user->save();
                    } catch (\Exception $e) {
                        $this->logger->error($errorMessage, ['user' => $user->toArray(), 'error' => $e->getMessage()]);
                        $this->renderJson(['errors' => $errorMessage], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        return;
                    }

                    $this->logger->info('User successfully updated', ['user' => $user->toArray()]);
                    $this->renderJson(['result' => 'success', 'user' => $user->getUserInfos()]);
                } else {
                    $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
                }
            } else {
                $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
                $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
            }
        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }

    /**
     * @param int $id
     */
    public function loadData($id): User
    {
        $user = new User();
        $user->load(['id = ?', [$id]]);

        return $user;
    }
}
