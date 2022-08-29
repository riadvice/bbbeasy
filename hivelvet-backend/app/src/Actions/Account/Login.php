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
use Helpers\Time;
use Models\Role;
use Models\User;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Login.
 */
class Login extends BaseAction
{
    public function authorise($f3): void
    {
        $form = $this->getDecodedBody();

        $dataChecker                = new DataChecker();
        $dataChecker->verify($email = $form['email'], Validator::email()->setName('email'));
        $dataChecker->verify($form['password'], Validator::length(8)->setName('password'));

        $userInfos = [];
        if ($dataChecker->allValid()) {
            $user = new User();
            $user = $user->getByEmail($email);
            $this->logger->info('Login attempt using email', ['email' => $email]);
            // Check if the user exists
            if ($user->valid() && UserStatus::ACTIVE === $user->status && $user->verifyPassword($form['password'])) {
                // @todo: test UserRole::API !== $user->role->name
                // valid credentials
                $this->session->authorizeUser($user);

                $user->last_login = Time::db();
                $user->password_attempts = 3;
                $user->save();

                // @todo: store role in redis cache to allow routes
                $this->f3->set('role', $user->role->name);

                // @todo: store locale in user prefs table
                // $this->session->set('locale', $user->locale);
                $userInfos = [
                    'username' => $user->username,
                    'email'    => $user->email,
                    'role'     => $user->role->name,
                ];
                $this->logger->info('User successfully logged in', ['email' => $email]);
                $this->renderJson($userInfos);
            } else if ($user->valid() && UserStatus::ACTIVE === $user->status && !$user->verifyPassword($form['password']) && $user->password_attempts > 1) {
                    $user->password_attempts -= 1;
                    $user->save();
                    $this->logger->error('Could not authenticate user with email', ['email' => $email]);
                    $this->renderJson(['message' => 'Wrong password. Attempts left : ' . $user->password_attempts], ResponseCode::HTTP_BAD_REQUEST);
            } else if ($user->valid() && $user->password_attempts == 0 || $user->password_attempts == 1) {
                $user->password_attempts = 0;
                $user->status = UserStatus::INACTIVE;
                $user->save();
                $this->logger->error('Could not authenticate user with email', ['email' => $email]);
                $this->renderJson(['message' => 'Your account has been locked because you have reached the maximum number of invalid sign-in attempts. You can contact the administrator or click here to receive an email containing instructions on how to unlock your account'], ResponseCode::HTTP_BAD_REQUEST);
            }  else if ($user->valid() && UserStatus::PENDING === $user->status) {
                $this->logger->error('Could not authenticate user with email', ['email' => $email]);
                $this->renderJson(['message' => 'Your account is not active. Please contact your administrator'], ResponseCode::HTTP_BAD_REQUEST);
            } else if ($user->valid() && UserStatus::DELETED === $user->status) {
                $this->logger->error('Could not authenticate user with email', ['email' => $email]);
                $this->renderJson(['message' => 'Your account has been disabled for violating our terms'], ResponseCode::HTTP_BAD_REQUEST);
            } else {
                $this->logger->error('Could not authenticate user with email', ['email' => $email]);
                $this->renderJson(['message' => 'Invalid Authentication data'], ResponseCode::HTTP_BAD_REQUEST);
            }
        } else {
            $this->logger->error('Could not authenticate user with email', ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
