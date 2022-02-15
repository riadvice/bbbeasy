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
use Mail\MailSender;
use Models\ResetTokenPassword;
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

            $this->logger->info('user', ['user' => $user->toArray()]);

            // valid credentials
            $this->session->authorizeUser($user);

            $this->session->set('locale', $user->locale);

            $mail       = new MailSender();
            $template   = 'common/reset_password';
            $resetToken = new ResetTokenPassword();

            $this->logger->info('user', ['user' => $user->toArray()]);
            $t = bin2hex(random_bytes(16));
            //if reset token has a row contains the id user then will update the current row with new status,new token and expires_at date
            if ($resetToken->userExists($user->id)) {
                $resetToken = $resetToken->getByUserID($user->id);
                $this->logger->info('reset token of this user', ['reset token' => $resetToken->toArray()]);

                $resetToken->expires_at = date('Y-m-d  H:i:s', strtotime('+15 min'));

                $resetToken->status = ResetTokenStatus::NEW;

                $resetToken->token = $t;

                $resetToken->save();
            } else {
                //otherwise will create a new row
                $resetToken->expires_at = date('Y-m-d H:i:s', strtotime('+15 min'));

                $resetToken->user_id = $user->id;
                $resetToken->status  = ResetTokenStatus::NEW;
                $resetToken->token   = $t;
                $resetToken->save();
            }

            $vars['token']            = $t;
            $vars['from_name']        = $this->f3->get('from_name');
            $vars['expires_at']       = $resetToken->expires_at;
            $vars['message_template'] = [$f3->format(
                $f3->get('i18n.label.mail.hi'),
                $f3->format($f3->get('i18n.label.mail.recieved_request')),
                $f3->format($f3->get('i18n.label.mail.no_changes')),
                $f3->format($f3->get('i18n.label.mail.reset_label')),
                $f3->format($f3->get('i18n.label.mail.reset_link'))
            ),
                $f3->format($f3->get('i18n.label.mail.expires_at')), ];
            $mail->send($template, $vars, $email, 'reset password', 'reset password');
            $this->logger->info('mail', ['mail' => $mail]);
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
