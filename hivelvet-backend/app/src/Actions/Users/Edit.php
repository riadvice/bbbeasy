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
use Enum\UserStatus;
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
        $body   = $this->getDecodedBody();
        $form   = $body['data'];

        $id     = $params['id'];
        $user   = $this->loadData($id);

        if ($user->valid()) {
            $dataChecker = new DataChecker();

            $dataChecker->verify($form['username'], Validator::length(4)->setName('username'));
            $dataChecker->verify($form['email'], Validator::email()->setName('email'));
            $dataChecker->verify($form['role'], Validator::notEmpty()->setName('role'));
            $dataChecker->verify($form['status'], Validator::notEmpty()->setName('status'));

            if ($dataChecker->allValid()) {
                $checkUser = new User();
                $users = $checkUser->find(['(username = ? and id != ?) or (email = ? and id != ?)', $form['username'], $id, $form['email'], $id]);
                if ($users) {
                    $users = $users->castAll();
                    if (count($users) == 1) {
                        $usernameExist = $users[0]['username'] == $form['username'];
                        $emailExist = $users[0]['email'] == $form['email'];
                        $message = ($usernameExist && $emailExist) ?
                            ['username' => 'username already exist','email' => 'email already exist'] :
                            ($usernameExist ? ['username' => 'username already exist'] : ['email' => 'email already exist']);
                    } else {
                        $message = ['username' => 'username already exist','email' => 'email already exist'];
                    }
                    $this->logger->error('User could not be updated', ['error' => $message]);
                    $this->renderJson(['errors' => $message], ResponseCode::HTTP_BAD_REQUEST);
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
                            $message = 'user could not be updated';
                            $this->logger->error('User could not be updated', ['user' => $user->toArray(), 'error' => $e->getMessage()]);
                            $this->renderJson(['errors' => $message], ResponseCode::HTTP_BAD_REQUEST);

                            return;
                        }

                        $this->logger->info('User successfully updated', ['user' => $user->toArray()]);
                        $this->renderJson(['result' => 'success', 'user' => $user->getUserInfos($user->id)]);
                    }
                }
            } else {
                $this->logger->error('Update user error', ['errors' => $dataChecker->getErrors()]);
                $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_BAD_REQUEST);
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
