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
use Enum\ResponseCode;
use Enum\UserStatus;
use Helpers\Time;
use Models\User;
use Models\UserSession;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Login.
 */
class Login extends BaseAction
{
    public function authorise($f3): void
    {
        $form        = $this->getDecodedBody();
        $email       = $form['email'];
        $password    = $form['password'];
        $dataChecker = new DataChecker();
        $dataChecker->verify($email, Validator::email()->setName('email'));
        $dataChecker->verify($password, Validator::length(8)->setName('password'));

        $errorMessage = 'Could not authenticate user with email';
        if ($dataChecker->allValid()) {
            $this->login($email, $password, $errorMessage);
        } else {
            $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    private function login($email, $password, $errorMessage): void
    {
        $user = new User();
        $user = $user->getByEmail($email);
        $this->logger->info('Login attempt using email', ['email' => $email]);

        if ($user->valid() && UserStatus::ACTIVE === $user->status && $user->verifyPassword($password)) {
            // @todo: test UserRole::API !== $user->role->name
            $this->session->authorizeUser($user);

            $user->last_login        = Time::db();
            $user->password_attempts = 3;
            $user->save();

            // @todo: store role in redis cache to allow routes
            $this->f3->set('role', $user->role->name);

            // @todo: store locale in user prefs table
            // $this->session->set('locale', $user->locale);
            $userInfos = [
                'id'          => $user->id,
                'username'    => $user->username,
                'email'       => $user->email,
                'role'        => $user->role->name,
                'avatar'      => $user->avatar,
                'permissions' => $user->role->getRolePermissions(),
            ];

            $userSession  = new UserSession();
            $sessionInfos = [
                'PHPSESSID' => session_id(),
                'expires'   => $userSession->getSessionExpirationTime(session_id()),
            ];

            $this->logger->info('User successfully logged in', ['email' => $email, 'session' => $sessionInfos]);
            $this->renderJson(['user' => $userInfos, 'session' => $sessionInfos]);
        } elseif ($user->valid() && UserStatus::ACTIVE === $user->status && !$user->verifyPassword($password) && $user->password_attempts > 1) {
            --$user->password_attempts;
            $user->save();
            $this->logger->error($errorMessage, ['email' => $email]);
            $this->renderJson(['message' => 'Invalid credentials provided, try again'], ResponseCode::HTTP_BAD_REQUEST);
        } elseif ($user->valid() && 0 === $user->password_attempts || 1 === $user->password_attempts) {
            $user->password_attempts = 0;
            $user->status            = UserStatus::INACTIVE;
            $user->save();
            $this->logger->error($errorMessage, ['email' => $email]);
            $this->renderJson(['message' => 'Your account has been locked because you have reached the maximum number of invalid sign-in attempts. You can contact the administrator or click here to receive an email containing instructions on how to unlock your account'], ResponseCode::HTTP_BAD_REQUEST);
        } elseif ($user->valid() && (UserStatus::PENDING === $user->status || UserStatus::INACTIVE === $user->status)) {
            $this->logger->error($errorMessage, ['email' => $email]);
            $this->renderJson(['message' => 'Your account is not active. Please contact your administrator'], ResponseCode::HTTP_BAD_REQUEST);
        } elseif ($user->valid() && UserStatus::DELETED === $user->status) {
            $this->logger->error($errorMessage, ['email' => $email]);
            $this->renderJson(['message' => 'Your account has been disabled for violating our terms'], ResponseCode::HTTP_BAD_REQUEST);
        } elseif (!$user->valid()) {
            $this->logger->error($errorMessage, ['email' => $email]);
            $this->renderJson(['message' => 'Invalid credentials provided, try again'], ResponseCode::HTTP_BAD_REQUEST);
        }
    }
}
