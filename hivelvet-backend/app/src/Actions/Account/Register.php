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
use Actions\Users\Add;
use Enum\ResponseCode;
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
        $form        = $this->getDecodedBody()['data'];
        $dataChecker = new DataChecker();

        $dataChecker->verify($form['username'], Validator::length(4)->setName('username'));
        $dataChecker->verify($form['email'], Validator::email()->setName('email'));
        $dataChecker->verify($form['password'], Validator::length(8)->setName('password'));
        $dataChecker->verify($form['confirmPassword'], Validator::length(8)->equals($form['password'])->setName('confirmPassword'));
        // @fixme: the agreement must be accepted only if there are terms for the website
        // otherwise in the login it should look for available terms of they were not previously available and ask to accept them
        $dataChecker->verify($form['agreement'], Validator::trueVal()->setName('agreement'));

        /** @todo : move to locales */
        $errorMessage = 'User could not be added';
        $successMessage = 'User successfully registered';
        if ($dataChecker->allValid()) {
            $user = new User();
            if ($this->credentialsAreValid($form, $user, $errorMessage)) {
                $addUserClass = new Add();
                $result = $addUserClass->addUser($form, $user, 2, $successMessage, $errorMessage);
                if ($result) {
                    $this->renderJson(['result' => 'success', ResponseCode::HTTP_CREATED]);
                }
            }
        } else {
            $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
