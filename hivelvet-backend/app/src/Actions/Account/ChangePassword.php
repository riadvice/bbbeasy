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

        if ($resetToken->getByToken($form['token'])) {
            if (!$resetToken->dry()) {
                if ($dataChecker->allValid()) {
                    $user               = new User();
                    $user               = $user->getById($resetToken->user_id);
                    $user->password     = $password;
                    $resetToken->status = ResetTokenStatus::CONSUMED;
                    $message = 'Reset password error : Password could not be changed';

                    if (!preg_match('/^[0-9A-Za-z !"#$%&\'()*+,-.\/:;<=>?@[\]^_`{|}&~]+$/', $password)) {
                        $this->logger->error($message, ['error' => 'Only use letters, numbers, and common punctuation characters']);
                        $this->renderJson(['message' => 'Only use letters, numbers, and common punctuation characters'], ResponseCode::HTTP_BAD_REQUEST);
                    } else {
                        $next = $this->isPasswordCommon($user->username, $user->email, $form['password']);
                        if ($user->verifyPassword($password) && $next) {
                            $this->logger->error($message, ['error' => 'New password cannot be the same as your old password']);
                            $this->renderJson(['message' => 'New password cannot be the same as your old password'] );
                        } else if ($next) {
                            try {
                                $resetToken->save();
                                $user->save();
                            } catch (\Exception $e) {
                                $message = 'Password could not be changed';
                                $this->logger->error($message, ['error' => $e->getMessage()]);
                                $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                                return;
                            }

                            $this->renderJson(['result' => 'success']);
                        }
                    }
                } else {
                    $this->logger->error($message, ['errors' => $dataChecker->getErrors()]);
                    $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
                }
            } else {
                $this->logger->error($message);
            }
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
