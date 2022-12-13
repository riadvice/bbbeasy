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
use Enum\UserStatus;
use Models\ResetPasswordToken;
use Models\User;
use Respect\Validation\Validator;
use Utils\SecurityUtils;
use Validation\DataChecker;

/**
 * Class ChangePassword.
 */
class ChangePassword extends BaseAction
{
    public function execute($f3): void
    {
        $form = $this->getDecodedBody();

        $username = $form['username'];
        $email    = $form['email'];
        $password = $form['password'];
        $token    = $form['token'];

        $dataChecker = new DataChecker();
        $dataChecker->verify($username, Validator::length(4)->setName('username'));
        $dataChecker->verify($email, Validator::email()->setName('email'));
        $dataChecker->verify($password, Validator::length(8)->setName('password'));
        $dataChecker->verify($token, Validator::length(16)->setName('token'));

        /** @todo : move to locales */
        $errorMessage = 'Password could not be changed';
        $responseCode = ResponseCode::HTTP_BAD_REQUEST;
        if (!$dataChecker->allValid()) {
            $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        } else {
            $resetToken = new ResetPasswordToken();
            $resetToken = $resetToken->getByToken($token);
            if (!$resetToken->dry()) {
                $user               = new User();
                $user               = $user->getById($resetToken->user_id);
                $resetToken->status = ResetTokenStatus::CONSUMED;
                $compliant          = SecurityUtils::isGdprCompliant($password);
                $common             = SecurityUtils::credentialsAreCommon($username, $email, $password);

                if (!$compliant) {
                    $this->logger->error($errorMessage, ['error' => $compliant]);
                    $this->renderJson(['message' => $compliant], $responseCode);
                } elseif ($common) {
                    $this->logger->error($errorMessage, ['error' => $common]);
                    $this->renderJson(['message' => $common], $responseCode);
                } elseif ($user->verifyPassword($password)) {
                    $message = 'New password cannot be the same as your old password';
                    $this->logger->error($errorMessage, ['error' => $message]);
                    $this->renderJson(['message' => $message], $responseCode);
                } else {
                    $this->changePassword($user, $password, $resetToken, $errorMessage);
                }
            } else {
                $this->logger->error($errorMessage);
                $this->renderJson(['message' => $errorMessage], ResponseCode::HTTP_NOT_FOUND);
            }
        }
    }

    /**
     * @param $responseCode
     * @param mixed $user
     * @param mixed $password
     * @param mixed $resetToken
     * @param mixed $errorMessage
     *
     * @throws \JsonException
     */
    private function changePassword($user, $password, $resetToken, $errorMessage): void
    {
        try {
            $user->password = $password;
            $user->status   = UserStatus::ACTIVE;
            $resetToken->save();
            $user->save();
        } catch (\Exception $e) {
            $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
            $this->renderJson(['message' => $errorMessage], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

            return;
        }
        $this->logger->info('Password successfully changed');
        $this->renderJson(['result' => 'success', ResponseCode::HTTP_CREATED]);
    }
}
