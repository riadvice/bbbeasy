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
use Enum\UserStatus;
use Models\User;

/**
 * Class Register
 * @package Actions\Account
 */
class Register extends BaseAction
{
    public function __construct()
    {
        parent::__construct();
    }

    public function signup($f3): void
    {
        $user   = new User();
        $form   = $this->getDecodedBody();

        $usernameExist  = $user->load(['username = ?', $form['username']]);
        $emailExist     = $user->load(['email = ?', $form['email']]);

        if ($usernameExist or $emailExist ) {
            $message = ($usernameExist and $emailExist) ? 'username and email already exist' : ($usernameExist ? 'username already exist' : 'email already exist');
            $this->logger->error('Registration error : user could not be added', ['error' => $message]);
            $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
        } else {
            $user->email        = $form['email'];
            $user->username     = $form['username'];
            $user->role         = UserRole::VISITOR;
            $user->status       = UserStatus::PENDING;

            try {
                $user->save();
            } catch (\Exception $e) {
                $message = 'user could not be added';
                $this->logger->error('Registration error : user could not be added', ['error' => $message]);
                $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }
            $this->logger->info('user successfully registered', ['user' => $user->toArray()]);
            $this->renderJson(['message' => 'Congratulations ! Your account has been successfully created.']);
        }
    }
}
