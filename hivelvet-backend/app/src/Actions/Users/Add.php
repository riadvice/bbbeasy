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
use Enum\ResponseCode;
use Enum\UserStatus;
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

        $dataChecker->verify($form['username'], Validator::length(4)->setName('username'));
        $dataChecker->verify($form['email'], Validator::email()->setName('email'));
        $dataChecker->verify($form['password'], Validator::length(4)->setName('password'));
        $dataChecker->verify($form['role'], Validator::notEmpty()->setName('role'));

        if ($dataChecker->allValid()) {
            $user  = new User();
            $users = $user->find(['username = ? or email = ?', $form['username'], $form['email']]);
            if ($users) {
                $users = $users->castAll();
                if (1 === \count($users)) {
                    $usernameExist = $users[0]['username'] === $form['username'];
                    $emailExist    = $users[0]['email'] === $form['email'];
                    $message       = ($usernameExist && $emailExist) ? 'username and email already exist' : ($usernameExist ? 'username already exist' : 'email already exist');
                } else {
                    $message = 'username and email already exist';
                }
                $this->logger->error('User could not be added', ['error' => $message]);
                $this->renderJson(['message' => $message], ResponseCode::HTTP_BAD_REQUEST);
            } else {
                $role = new Role();
                $role->load(['id = ?', [$form['role']]]);
                if ($role->valid()) {
                    $user->email    = $form['email'];
                    $user->username = $form['username'];
                    $user->password = $form['password'];
                    $user->status   = UserStatus::PENDING;
                    $user->role_id  = $role->id;

                    try {
                        $user->save();
                    } catch (\Exception $e) {
                        $message = 'user could not be added';
                        $this->logger->error('User could not be added', ['user' => $user->toArray(), 'error' => $e->getMessage()]);
                        $this->renderJson(['message' => $message], ResponseCode::HTTP_BAD_REQUEST);

                        return;
                    }

                    $this->logger->info('User successfully added', ['user' => $user->toArray()]);
                    $this->renderJson(['result' => 'success', 'user' => $user->getUserInfos($user->id)]);
                } else {
                    $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
                }
            }
        } else {
            $this->logger->error('Add user error', ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
