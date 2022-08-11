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
use Enum\ResetTokenStatus;
use Enum\ResponseCode;
use Models\ResetPasswordToken;
use Models\User;

/**
 * Class ChangePassword.
 */
class ChangePassword extends BaseAction
{
    public function execute($f3): void
    {
        $form = $this->getDecodedBody();

        $new_password = $form['password'];
        $resetToken = new ResetPasswordToken();

        if ($resetToken->getByToken($form['token'])) {
            if (!$resetToken->dry()) {
                $user               = new User();
                $user               = $user->getById($resetToken->user_id);
                $old_password_hash  = $user->password;
                $user->password     = $new_password;
                $resetToken->status = ResetTokenStatus::CONSUMED;
                if (password_verify($new_password , $old_password_hash)) {
                    $this->renderJson(['message' => 'New password cannot be the same as your old password']);
                }
                else {
                    try {
                        $resetToken->save();
                        $user->save();
                    } catch (\Exception $e) {
                        $message = 'password could not be changed';
                        $this->logger->error('reset password error : password could not be changed', ['error' => $e->getMessage()]);
                        $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                        return;
                    }
                    $this->renderJson(['result' => 'success']);
                }
            }
        } else {
            $this->logger->error('reset password error : password could not be changed');
        }
    }
}
