<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBEasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

namespace Actions\Account;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Models\User;

/**
 * Class SaveLogo.
 */
class RemoveLogo extends BaseAction
{
    /**
     * @param mixed $f3
     * @param mixed $params
     *
     * @throws \JsonException
     */
    public function execute($f3, $params): void
    {
        $user = new User();
        $id   = $this->session->get('user.id');
        $user = $user->findone(['id = ?', [$id]]);
        if ($user->dry()) {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);
        } else {
            // Update the avatar to null
            $user->avatar = null;

            // Save the changes to the user record
            $user->save();

            // Return a success response
            $this->logger->info('Avatar successfully updated', ['user' => $user->toArray()]);
            $this->renderJson(['result' => 'success', 'user' => $user->toArray()]);
        }
    }
}
