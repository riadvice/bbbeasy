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

        $error_message = 'Administrator could not be added';

        if (!SecurityUtils::isGdprCompliant($form['password'])) {
            $this->logger->error($error_message, ['error' => 'Only use letters, numbers, and common punctuation characters']);
            $this->renderJson(['message' => 'Only use letters, numbers, and common punctuation characters']);
        } else {
            $error = 'Avoid choosing a common password';
            if (SecurityUtils::credentialsAreCommon($form['username'], $form['email'], $form['password'], $error_message, null)) {
                //  @fixme:  better routes testing
                '/users/collect-admin' === "{$_SERVER['REQUEST_URI']}" ? $this->renderJson(['message' => $error]) : $this->renderJson(['message' => $error], $response_code);

                return;
            }
            $users = $this->getUsersByUsernameOrEmail($form['username'], $form['email']);
            $error = $user->usernameOrEmailExists($form['username'], $form['email'], $users);
            if ($error) {
                $this->logger->error($error_message, ['error' => $error]);
                $this->renderJson(['message' => $error]);
            }
        }
    }
}
