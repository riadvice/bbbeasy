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
use Enum\ResponseCode;
use Enum\UserRole;
use Models\Setting;
use Models\User;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Register.
 */
class Register extends BaseAction
{
    public function signup($f3): void
    {
        $body = $this->getDecodedBody();
        $form = $body['data'];

        $dataChecker = new DataChecker();

        $username        = $form['username'];
        $email           = $form['email'];
        $password        = $form['password'];
        $confirmPassword = $form['confirmPassword'];

        $dataChecker->verify($username, Validator::length(4)->setName('username'));
        $dataChecker->verify($email, Validator::email()->setName('email'));
        $dataChecker->verify($password, Validator::length(8)->setName('password'));
        $dataChecker->verify($confirmPassword, Validator::length(8)->equals($password)->setName('confirmPassword'));

        $setting = new Setting();

        /** @var Setting $settings */
        $settings = $setting->find([], ['limit' => 1])->current();
        if (!$settings->dry() && isset($settings->terms_use)) {
            // the agreement must be accepted only if there are terms for the website
            // otherwise in the login it should look for available terms of they were not previously available and ask to accept them
            $dataChecker->verify($form['agreement'], Validator::trueVal()->setName('agreement'));
        }

        /** @todo : move to locales */
        $errorMessage   = 'User could not be added';
        $successMessage = 'User successfully registered';
        if ($dataChecker->allValid()) {
            if ($this->credentialsAreValid($username, $email, $password, $errorMessage)) {
                $user = new User();

                $result = $user->saveUserWithDefaultPreset($username, $email, $password, UserRole::LECTURER_ID, $successMessage, $errorMessage);
                if ($result) {
                    $this->renderJson(['result' => 'success', ResponseCode::HTTP_CREATED]);
                } else {
                    $this->renderJson(['message' => $errorMessage], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);
                }
            }
        } else {
            $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
