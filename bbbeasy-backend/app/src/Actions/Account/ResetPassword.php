<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with BBBeasy. If not, see <https://www.gnu.org/licenses/>
 */

namespace Actions\Account;

use Actions\Base as BaseAction;
use Enum\ResetTokenStatus;
use Enum\ResponseCode;
use Mail\MailSender;
use Models\ResetPasswordToken;
use Models\User;
use Respect\Validation\Validator;
use Validation\DataChecker;

class ResetPassword extends BaseAction
{
    public function execute($f3): void
    {
        $user        = new User();
        $form        = $this->getDecodedBody();
        $email       = $form['email'];
        $dataChecker = new DataChecker();
        $dataChecker->verify($email, Validator::email()->setName('email'));

        if (!$dataChecker->allValid()) {
            $this->logger->error('User could not reset password', ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        } elseif (!$user->dry() && $user->emailExists($email)) {
            // valid credentials
            $this->session->authorizeUser($user);

            // $this->session->set('locale', $user->locale);

            $mailer     = new MailSender();
            $resetToken = new ResetPasswordToken();

            // if user does not have a reset token
            if (!$resetToken->userExists($user->id)) {
                $resetToken          = new ResetPasswordToken();
                $resetToken->user_id = $user->id;
            }
            $resetToken->expires_at = date('Y-m-d H:i:s', strtotime('+15 min'));
            $resetToken->status     = ResetTokenStatus::NEW;
            // otherwise, will update the existing row
            $resetToken->save();

            $emailTokens['from_name']  = $this->f3->get('from_name');
            $emailTokens['expires_at'] = $resetToken->expires_at;
            $emailTokens['token']      = $resetToken->token;

            $emailTokens['message_template'] = [
                $f3->format(
                    $f3->get('i18n.label.mail.hi'),
                    $f3->format($f3->get('i18n.label.mail.received_request')),
                    $f3->format($f3->get('i18n.label.mail.no_changes')),
                    $f3->format($f3->get('i18n.label.mail.reset_label')),
                    $f3->format($f3->get('i18n.label.mail.reset_link'))
                ),
                $f3->format($f3->get('i18n.label.mail.expires_at')),
            ];
            $sent = $mailer->send('common/reset_password', $emailTokens, $email, 'reset password', 'reset password');
            $this->logger->info('mail', ['mail' => $mailer]);
            if ($sent) {
                $this->renderJson(['message' => 'Please check your email to reset your password']);
            }
            // @fixme: and if the mail wasn't sent?
        } else {
            // email invalid or user no exist
            $message = 'User does not exist with this email';
            $this->logger->error('Reset password error : user not exist', ['error' => $message]);
            $this->renderJson(['message' => $message], ResponseCode::HTTP_NOT_FOUND);
        }
    }
}
