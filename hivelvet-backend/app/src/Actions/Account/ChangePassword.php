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
use Models\ResetTokenPassword;
use Models\User;

/**
 * Class ChangePassword
 * @package Actions\Account
 */
class ChangePassword extends BaseAction
{
    public function execute($f3): void
    {
        $user       = new User();
        $resetToken = new ResetTokenPassword();
        $form       = $this->getDecodedBody();

        $token    = $form['token'];
        $password = $form['password'];

        $resetToken = $resetToken->getByToken($token);

        $user               = $user->getByID($resetToken->userID);
        $user->password     = $password;
        $resetToken->status = 'consumed';

        try {
            $resetToken->save();
            $user->save();
        } catch (\Exception $e) {
            $message = 'password could not be changed';
            $this->logger->error('reset password error : password could not be changed', ['error' => $message]);
            $this->renderJson(['message' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

            return;
        }

        $this->renderJson(['message' => 'password changed successfully', 'user' => $user->toArray()]);
    }
}
