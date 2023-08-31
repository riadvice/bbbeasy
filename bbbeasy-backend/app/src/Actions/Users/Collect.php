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

namespace Actions\Users;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Collect.
 */
class Collect extends BaseAction
{
    public function execute($f3): void
    {
        $body        = $this->getDecodedBody();
        $form        = $body['data'];
        $dataChecker = new DataChecker();

        $username = $form['username'];
        $email    = $form['email'];
        $password = $form['password'];

        $dataChecker->verify($username, Validator::length(4)->setName('username'));
        $dataChecker->verify($email, Validator::email()->setName('email'));
        $dataChecker->verify($password, Validator::length(8)->setName('password'));

        if (!$dataChecker->allValid()) {
            $this->logger->error('Initial application setup : Add administrator', ['errors' => $dataChecker->getErrors()]);
            $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);
        } else {
            $errorMessage = 'Administrator could not be added';
            $this->credentialsAreValid($username, $email, $password, $errorMessage);
        }
    }
}
