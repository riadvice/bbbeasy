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
use Validation\Validator;

/**
 * Class Register.
 */
class Register extends BaseAction
{
    public function __construct()
    {
        parent::__construct();
    }

    public function signup($f3): void
    {
        $user = new User();
        $body = $this->getDecodedBody();
        $form = $body['data'];
        $v    = new Validator();

        $v->notEmpty()->verify('username', $form['username'], ['notEmpty' => 'Username is required']);
        $v->notEmpty()->verify('email', $form['email'], ['notEmpty' => 'Email is required']);
        $v->notEmpty()->verify('password', $form['password'], ['notEmpty' => 'Password is required']);
        $v->notEmpty()->verify('confirmPassword', $form['confirmPassword'], ['notEmpty' => 'Confirm password is required']);
        $v->trueVal()->verify('agreement', $form['agreement'], ['trueVal' => 'Should accept the agreement']);

        if ($v->allValid()) {
            $v->email()->verify('email', $form['email'], ['email' => 'Email is invalid']);
            $v->length(4)->verify('password', $form['password'], ['length' => 'Password must be at least 4 characters']);
            $v->length(4)->verify('confirmPassword', $form['confirmPassword'], ['length' => 'Confirm password must be at least 4 characters']);
            $v->equals($form['password'])->verify('confirmPassword', $form['confirmPassword'], ['equals' => 'The two passwords that you entered do not match']);

            if ($v->allValid()) {
                $usernameExist = $user->load(['username = ?', $form['username']]);
                $emailExist    = $user->load(['email = ?', $form['email']]);

                if ($usernameExist || $emailExist) {
                    $message = ($usernameExist && $emailExist) ? 'username and email already exist' : ($usernameExist ? 'username already exist' : 'email already exist');
                    $this->logger->error('Registration error : user could not be added', ['error' => $message]);
                    $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                } else {
                    $user->email    = $form['email'];
                    $user->username = $form['username'];
                    $user->password = $form['password'];
                    $user->role     = UserRole::VISITOR;
                    $user->status   = UserStatus::PENDING;

                    try {
                        $user->save();
                    } catch (\Exception $e) {
                        $message = 'user could not be added';
                        $this->logger->error('Registration error : user could not be added', ['user' => $user->toArray(), 'error' => $e->getMessage()]);
                        $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                        return;
                    }
                    $this->logger->info('user successfully registered', ['user' => $user->toArray()]);
                    $this->renderJson(['message' => 'Congratulations ! Your account has been successfully created.']);
                }
            } else {
                $this->logger->error('Registration error', ['errors' => $v->getErrors()]);
                $this->renderJson(['errors' => $v->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
            }
        } else {
            $this->logger->error('Registration error', ['errors' => $v->getErrors()]);
            $this->renderJson(['errors' => $v->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
