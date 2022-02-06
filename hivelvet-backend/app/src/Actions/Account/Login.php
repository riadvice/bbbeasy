<?php

/**
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
use Helpers\Time;
use Models\User;

/**
 * Class Login
 * @package Actions\Account
 */
class Login extends BaseAction
{
    public function __construct()
    {
        parent::__construct();
    }

    public function authorise($f3): void
    {
        $user   = new User();
        $form   = $this->getDecodedBody();

        $email    = $form['email'];
        $password = $form['password'];

        if ($user->emailExists($email)) {
            $user = $user->getByEmail($email);
            //$user->status === UserStatus::ACTIVE &&
            if ($user->role !== UserRole::API && $user->verifyPassword($password)) {
                // valid credentials
                $this->session->authorizeUser($user);

                $user->last_login = Time::db();
                $user->save();

                $this->session->set('locale', $user->locale);
                $message   = 'Welcome back '. $user->username .' !';
                $userInfos = [
                    'username' => $user->username,
                    'email'    => $user->email,
                    'role'     => $user->role,
                ];
                $this->logger->info('user successfully login', ['message' => $message]);
                $this->renderJson(['message' => $message, 'user' => json_encode($userInfos)]);
            } else {
                //password invalid
                $message = 'Invalid Password';
                $this->logger->error('Login error : user could not logged', ['error' => $message]);
                $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            // email invalid or user no exist
            $message = 'Invalid Email';
            $this->logger->error('Login error : user could not logged', ['error' => $message]);
            $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
