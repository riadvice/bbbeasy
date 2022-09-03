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
use Validation\DataChecker;
use Respect\Validation\Validator;
use Models\User;

/**
 * Class ChangePassword.
 */
class ChangePassword extends BaseAction
{
    public function execute($f3): void
    {
        $form = $this->getDecodedBody();
        
        $password   = $form['password'];
        $resetToken = new ResetPasswordToken();
        
        $dataChecker = new DataChecker();
        $dataChecker->verify($password, Validator::length(8)->setName('password'));

        $pattern = '/^[0-9A-Za-z !"#$%&\'()*+,-.\/:;<=>?@[\]^_`{|}~]+$/';
        $error_message = 'Password could not be changed';
        if ($resetToken->getByToken($form['token'])) {
            if (!$resetToken->dry()) {
                if ($dataChecker->allValid()) {
                    $user               = new User();
                    $user               = $user->getById($resetToken->user_id);
                    $resetToken->status = ResetTokenStatus::CONSUMED;

                    if (!preg_match($pattern, $password)) {
                        $this->logger->error($error_message, ['error' => 'Only use letters, numbers, and common punctuation characters']);
                        $this->renderJson(['message' => 'Only use letters, numbers, and common punctuation characters'], ResponseCode::HTTP_BAD_REQUEST);
                    } else {
                        $this->changePassword($user, $password, $resetToken, $error_message);
                    }
                } else {
                    $this->logger->error($error_message, ['errors' => $dataChecker->getErrors()]);
                    $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
                }
            } else {
                $this->logger->error($error_message);
            }
        }
    }

    private function changePassword($user, $password, $resetToken, $error_message): void
    {
        $next = $this->isPasswordCommon($user->username, $user->email, $password, $error_message);
        if ($user->verifyPassword($password) && $next) {
            $this->logger->error($error_message, ['error' => 'New password cannot be the same as your old password']);
            $this->renderJson(['message' => 'New password cannot be the same as your old password'] );
        } elseif ($next) {
            try {
                $user->password = $password;
                $resetToken->save();
                $user->save();
            } catch (\Exception $e) {
                $message = 'Password could not be changed';
                $this->logger->error($error_message, ['error' => $e->getMessage()]);
                $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }

            $this->renderJson(['result' => 'success']);
        }
    }
}
