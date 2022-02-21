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
use Models\ResetTokenPassword;

class GetResetTokenPassword extends BaseAction
{
    public function execute($f3, $params): void
    {
        $token = $f3->get('GET.token');

        $resetToken = new ResetTokenPassword();
        if ($resetToken->tokenExists($token)) {
            if (!$resetToken->dry()) {
                $this->logger->info('token exists', ['token' => $token]);
                if (ResetTokenStatus::NEW === $resetToken->status) {
                    if ($resetToken->expires_at <= date('Y-m-d H:i:s')) {
                        $resetToken->status = ResetTokenStatus::EXPIRED;
                        $resetToken->save();
                        $this->logger->error('token was expired');
                        $this->renderJson(['message' => 'token was expired'], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                    } else {
                        $this->renderJson(['reset token' => $resetToken->toArray(), ResponseCode::HTTP_OK]);
                    }
                }
                if (ResetTokenStatus::CONSUMED === $resetToken->status) {
                    $this->logger->error('token was consumed');
                    $this->renderJson(['message' => 'token was consumed , you should request to reset your password again '], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                }
            }
        } else {
            $this->logger->error('token does not exist');
            $this->renderJson(['message' => 'token does not exist , you should request to reset your password again '], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
