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

namespace Actions\Users;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Base;
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
     * @param Base  $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body = $this->getDecodedBody();
        $form = $body['data'];

        $id   = $params['id'];
        $user = $this->loadData($id);

        $username_message = 'Username already exists';
        $email_message = 'Email already exists';
        $error_message = 'User could not be updated';

        if ($user->valid()) {
            $dataChecker = new DataChecker();

            $dataChecker->verify($form['username'], Validator::length(4)->setName('username'));
            $dataChecker->verify($form['email'], Validator::email()->setName('email'));
            $dataChecker->verify($form['role'], Validator::notEmpty()->setName('role'));
            $dataChecker->verify($form['status'], Validator::notEmpty()->setName('status'));

            if ($dataChecker->allValid()) {
                $checkUser = new User();
                $users     = $checkUser->find(['(username = ? and id != ?) or (email = ? and id != ?)', $form['username'], $id, $form['email'], $id]);
                if ($users) {
                    $users = $users->castAll();
                    if (1 === \count($users)) {
                        $usernameExist = $users[0]['username'] === $form['username'];
                        $emailExist    = $users[0]['email'] === $form['email'];
                        $message       = ($usernameExist && $emailExist) ?
                            ['username' => $username_message, 'email' => $email_message] :
                            ($usernameExist ? ['username' => $username_message] : ['email' => $email_message]);
                    } else {
                        $message = ['username' => $username_message, 'email' => $email_message];
                    }
                    $this->logger->error($error_message, ['error' => $message]);
                    $this->renderJson(['errors' => $message], ResponseCode::HTTP_PRECONDITION_FAILED);
                } else {
                    $role = new Role();
                    $role->load(['id = ?', [$form['role']]]);
                    if ($role->valid()) {
                        $user->email    = $form['email'];
                        $user->username = $form['username'];
                        $user->status   = $form['status'];
                        $user->role_id  = $role->id;

                        try {
                            $user->save();
                        } catch (\Exception $e) {
                            $this->logger->error($error_message, ['user' => $user->toArray(), 'error' => $e->getMessage()]);
                            $this->renderJson(['errors' => $error_message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                            return;
                        }

                        $this->logger->info('User successfully updated', ['user' => $user->toArray()]);
                        $this->renderJson(['result' => 'success', 'user' => $user->getUserInfos($user->id)]);
                    } else {
                        $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
                    }
                }
            } else {
                $this->logger->error('Update user error', ['errors' => $dataChecker->getErrors()]);
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
