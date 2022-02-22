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
use Respect\Validation\Validator;
use Validation\DataChecker;

class GetResetPasswordToken extends BaseAction
{
    /**
     * @param $f3
     * @param $params
     *
     * @throws \JsonException
     */
    public function execute($f3, $params): void
    {
        $token = $f3->get('PARAMS.token');

        $this->logger->info('Request to use password reset token', ['token' => $token]);
        $dataIsValid = false;
        $dataChecker = new DataChecker();
        $dataChecker->verify($token, Validator::length(16)->setName('token'));

        if ($dataChecker->allValid()) {
            $resetToken = new ResetPasswordToken();
            $resetToken = $resetToken->getByToken($token);
            // @todo: validate against user too!
            if (!$resetToken->dry() && $resetToken->isUsable()) {
                $this->logger->info('Valid token used for password reset', ['token' => $token, 'status' => $resetToken->status, 'expires_at' => $resetToken->expires_at]);
                $dataIsValid = true;
                $this->renderJson(['token' => $token, ResponseCode::HTTP_OK]);
            } elseif (!$resetToken->dry() && !$resetToken->isUsable() && ResetTokenStatus::NEW === $resetToken->status) {
                $this->logger->warning('Marking not used in time password reset token as expired.', ['token' => $token, 'status' => $resetToken->status, 'expires_at' => $resetToken->expires_at]);
                $resetToken->status = ResetTokenStatus::EXPIRED;
                $resetToken->save();
            }
        }

        if (!$dataIsValid) {
            $this->logger->error('Cannot validate password reset token', ['token' => $token]);
            $this->renderJson(['message' => 'Invalid password reset token'], ResponseCode::HTTP_BAD_REQUEST);
        }
    }
}
