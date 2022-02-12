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
use Enum\ResponseCode;
use Mail\MailSender;
use Models\User;

class Reset extends BaseAction
{
    public function __construct()
    {
        parent::__construct();
    }

    public function execute($f3): void
    {
        $user = new User();
        $form = $this->getDecodedBody();

        $email = $form['email'];

        if ($user->emailExists($email)) {
            $user = $user->getByEmail($email);

            // valid credentials
            $this->session->authorizeUser($user);

            $this->session->set('locale', $user->locale);

            $mail     = new MailSender();
            $template = 'common/reset_password';
            $mail->send($template, [], $email, 'reset password', 'reset password');

            if ($mail) {
                $this->renderJson(['message' => 'Please check your email to reset your password '], ResponseCode::HTTP_OK);
            }
        } else {
            // email invalid or user no exist
            $message = 'User does not exist with this email';
            $this->logger->error('Login error : user could not logged', ['error' => $message]);
            $this->renderJson(['message' => $message], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
