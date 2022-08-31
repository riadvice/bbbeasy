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
use Enum\ResponseCode;

/**
 * Class Collect.
 */
class Collect extends BaseAction
{    
    public function execute($f3): void
    {
        $form = $this->getDecodedBody()['data'];
        $user = new User();
        $message = 'Initial application setup : Administrator could not be added';
        
        if (!preg_match('/^[0-9A-Za-z !"#$%&\'()*+,-.\/:;<=>?@[\]^_`{|}&~]+$/', $form['password'])) {
            $this->logger->error($message, ['error' => 'Only use letters, numbers, and common punctuation characters']);
            $this->renderJson(['message' => 'Only use letters, numbers, and common punctuation characters'], ResponseCode::HTTP_BAD_REQUEST);
        } else {
            $next = $this->isPasswordCommon($form['username'], $form['email'], $form['password']);
            $error = $user->usernameOrEmailExists($form['username'], $form['email']);
            if ($error && $next) {
                $this->logger->error($message, ['error' => $error]);
                $this->renderJson(['message' => $error]);
            }
        }
    }

    private function isPasswordCommon($username, $email, $password) {
        $dictionary = file_GET_contents("http://api.hivelvet.test/dictionary/en-US.json");
        $words = json_decode($dictionary);
        foreach ($words as $word) {
            if (strcmp($password, $username) == 0 || strcmp($password, $email) == 0 || strcmp($password, $word) == 0) {
                $this->logger->error($message, ['error' => 'Avoid choosing a common password']);
                $this->renderJson(['message' => 'Avoid choosing a common password'], ResponseCode::HTTP_BAD_REQUEST);
                return false;
            }
        }
        return true;
    }
}
