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

namespace Actions\Users;

use Actions\Base as BaseAction;
use Models\User;
use Utils\SecurityUtils;

/**
 * Class Collect.
 */
class Collect extends BaseAction
{
    public function execute($f3): void
    {
        $form = $this->getDecodedBody()['data'];
        $user = new User();

        $username = $form['username'];
        $email    = $form['email'];
        $password = $form['password'];

        $users = $user->getUsersByUsernameOrEmail($username, $email);

        $compliant    = SecurityUtils::isGdprCompliant($password);
        $common       = SecurityUtils::credentialsAreCommon($username, $email, $password);
        $found        = $user->userExists($username, $email, $users);
        $errorMessage = 'Administrator could not be added';

        if (!$compliant) {
            $this->logger->error($errorMessage, ['error' => $compliant]);
            $this->renderJson(['message' => $compliant]);
        } elseif ($common) {
            $this->logger->error($errorMessage, ['error' => $common]);
            $this->renderJson(['message' => $common]);
        } elseif ($found) {
            $this->logger->error($errorMessage, ['error' => $found]);
            $this->renderJson(['message' => $found]);
        }
    }
}
