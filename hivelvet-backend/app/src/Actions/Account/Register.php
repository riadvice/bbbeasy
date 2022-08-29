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
        $form        = $this->getDecodedBody()['data'];
        $dataChecker = new DataChecker();

        $dataChecker->verify($form['username'], Validator::length(4)->setName('username'));
        $dataChecker->verify($form['email'], Validator::email()->setName('email'));
        $dataChecker->verify($form['password'], Validator::length(8)->setName('password'));
        $dataChecker->verify($form['confirmPassword'], Validator::length(8)->equals($form['password'])->setName('confirmPassword'));
        // @fixme: the agreement must be accepted only if there are terms for the website
        // otherwise in the login it should look for available terms of they were not previously available and ask to accept them
        $dataChecker->verify($form['agreement'], Validator::trueVal()->setName('agreement'));

        if ($dataChecker->allValid()) {
            $user  = new User();
            if (!preg_match('/^[0-9A-Za-z !"#$%&\'()*+,-.\/:;<=>?@[\]^_`{|}&~]+$/', $form['password'])) {
                $this->logger->error('Registration error', ['error' => 'Only use letters, numbers, and common punctuation characters']);
                $this->renderJson(['message' => 'Only use letters, numbers, and common punctuation characters'], ResponseCode::HTTP_BAD_REQUEST);
            } else {
                $next = $this->isPasswordCommon($form['username'], $form['email'], $form['password']);
                $error = $user->usernameOrEmailExists($form['username'], $form['email']);
                if ($error && $next) {
                    $this->logger->error('Registration error : User could not be added', ['error' => $error]);
                    $this->renderJson(['message' => $error], ResponseCode::HTTP_PRECONDITION_FAILED);
                } else if ($next) {
                    $user->email    = $form['email'];
                    $user->username = $form['username'];
                    $user->password = $form['password'];
                    $user->role_id  = 2;
                    $user->status   = UserStatus::PENDING;
                    $user->password_attempts = 3;

                    try {
                        $user->save();
                    } catch (\Exception $e) {
                        $message = 'User could not be added';
                        $this->logger->error('Registration error : User could not be added', ['user' => $user->toArray(), 'error' => $e->getMessage()]);
                        $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        return;
                    }
                    $this->logger->info('User successfully registered', ['user' => $user->toArray()]);
                    $this->renderJson(['result' => 'success', ResponseCode::HTTP_CREATED]);
                }
            }
        } else {
            $this->logger->error('Registration error', ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    private function isPasswordCommon($username, $email, $password) {
        $dictionary = file_GET_contents("http://api.hivelvet.test/dictionary/en-US.json");
        $words = json_decode($dictionary);
        foreach ($words as $word) {
            if (strcmp($password, $username) == 0 || strcmp($password, $email) == 0 || strcmp($password, $word) == 0) {
                $this->logger->error('Initial application setup : Administrator could not be added', ['error' => 'Avoid choosing a common password']);
                $this->renderJson(['message' => 'Avoid choosing a common password'], ResponseCode::HTTP_BAD_REQUEST);
                return false;
            }
        }
        return true;
    }
}
