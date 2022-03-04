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

namespace Actions\Account;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Enum\UserRole;
use Enum\UserStatus;
use Models\User;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Register.
 */
class Register extends BaseAction
{
    public function signup($f3): void
    {
        // @fixme: must comply to user creation policy
        $user = new User();
        $form = $this->getDecodedBody()['data'];

        $dataChecker = new DataChecker();

        $dataChecker->verify($form['username'], Validator::length(4)->setName('username'));
        $dataChecker->verify($form['email'], Validator::email()->setName('email'));
        $dataChecker->verify($form['password'], Validator::length(4)->setName('password'));
        $dataChecker->verify($form['confirmPassword'], Validator::length(4)->equals($form['password'])->setName('confirmPassword'));
        // @fixme: the agreement must be accepted only if there are terms for the website
        // otherwise in the login it should look for available terms of they were not previously available and ask to accept them
        $dataChecker->verify($form['agreement'], Validator::trueVal()->setName('agreement'));

        if ($dataChecker->allValid()) {
            $usernameExist = $user->load(['username = ?', $form['username']]);
            $emailExist    = $user->load(['email = ?', $form['email']]);

            if ($usernameExist || $emailExist) {
                $message = ($usernameExist && $emailExist) ? 'username and email already exist' : ($usernameExist ? 'username already exist' : 'email already exist');
                $this->logger->error('Registration error : user could not be added', ['error' => $message]);
                $this->renderJson(['message' => $message], ResponseCode::HTTP_BAD_REQUEST);
            } else {
                $user->email    = $form['email'];
                $user->username = $form['username'];
                $user->password = $form['password'];
                $user->role     = UserRole::LECTURER;
                $user->status   = UserStatus::PENDING;

                try {
                    $user->save();
                } catch (\Exception $e) {
                    $message = 'user could not be added';
                    $this->logger->error('Registration error : user could not be added', ['user' => $user->toArray(), 'error' => $e->getMessage()]);
                    $this->renderJson(['message' => $message], ResponseCode::HTTP_BAD_REQUEST);

                    return;
                }
                $this->logger->info('user successfully registered', ['user' => $user->toArray()]);
                $this->renderJson(['message' => 'User account created.']);
            }
        } else {
            $this->logger->error('Registration error', ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_BAD_REQUEST);
        }
    }
}
