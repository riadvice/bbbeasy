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

namespace Actions\Account;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\User;
use Respect\Validation\Validator;
use Utils\DataUtils;
use Validation\DataChecker;

/**
 * Class Edit.
 */
class Edit extends BaseAction
{
    use RequirePrivilegeTrait;

    public function save($f3): void
    {
        $body = $this->getDecodedBody();
        $form = $body['data'];

        $errorMessage = 'Account could not be updated';

        $id   = $this->session->get('user.id');
        $user = new User();
        $user = $user->findone(['id = ?', [$id]]);
        if ($user->valid()) {
            $username             = $form['username'];
            $email                = $form['email'];
            $current_password     = $form['current_password'];
            $new_password         = $form['new_password'];
            $confirm_new_password = $form['confirm_new_password'];
            $avatar               = $form['avatar'];

            $updatePassword = null !== $new_password && null !== $confirm_new_password;
            $updateAvatar   = null !== $avatar;

            $dataChecker = new DataChecker();

            $dataChecker->verify($username, Validator::length(4)->setName('username'));
            $dataChecker->verify($email, Validator::email()->setName('email'));
            $dataChecker->verify($current_password, Validator::length(8)->setName('current_password'));
            if ($updatePassword) {
                $dataChecker->verify($new_password, Validator::length(8)->setName('new_password'));
                $dataChecker->verify($confirm_new_password, Validator::length(8)->equals($new_password)->setName('confirm_new_password'));
            }

            if ($dataChecker->allValid()) {
                if ($user->verifyPassword($current_password)) {
                    if ($this->credentialsAreValid($username, $email, $new_password, $errorMessage, $id)) {
                        if ($updateAvatar) {
                            if (!DataUtils::validateImageFormat($avatar)) {
                                $this->logger->error($errorMessage, ['errors' => 'invalid file format']);

                                $this->renderJson(['message' => 'invalid file format'], ResponseCode::HTTP_PRECONDITION_FAILED);

                                return;
                            }
                        }
                        $user->username = $username;
                        $user->email    = $email;
                        $user->avatar   = $avatar;
                        if ($updatePassword) {
                            $user->password = $new_password;
                        }

                        try {
                            $user->save();
                        } catch (\Exception $e) {
                            $this->logger->error($errorMessage, ['user' => $user->toArray(), 'error' => $e->getMessage()]);
                            $this->renderJson(['errors' => $errorMessage], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                            return;
                        }

                        // update user session
                        $this->session->updateUser($user);
                        $this->logger->info('Profile successfully updated', ['user' => $user->toArray()]);
                        $this->renderJson(['result' => 'success', 'user' => $user->toArray(['username', 'email', 'avatar'])]);
                    }
                } else {
                    // incorrect password
                    $message = 'New password cannot be the same as your old password';
                    $this->logger->error($errorMessage, ['error' => $message]);
                    $this->renderJson(['errors' => $message], ResponseCode::HTTP_BAD_REQUEST);
                }
            } else {
                $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
                $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
            }
        } else {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
