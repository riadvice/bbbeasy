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
use Enum\Locale;
use Enum\ResponseCode;
use Models\User;

/**
 * Class SetLocal.
 */
class SetLocale extends BaseAction
{
    /**
     * Save the user locale.
     *
     * @param \Base $f3
     * @param array $params
     *
     * @throws
     */
    public function execute($f3, $params): void
    {
        $locale        = $params['locale'];
        $localeUpdated = false;

        if (Locale::contains($params['locale'])) {
            $this->session->set('locale', $locale);
            $localeUpdated = true;
        }

        if ($this->session->isLoggedIn()) {
            $this->updateUserLocale($params['locale']);
        }
        // TODO: remove unnecessary data, code is enough
        $result = ['locale' => $locale];
        // TODO: remove unnecessary data, code is enough
        if (!$localeUpdated) {
            $result = ['accepted' => false];
        }

        $this->renderJson($result, $localeUpdated ? ResponseCode::HTTP_OK : ResponseCode::HTTP_NOT_FOUND);
    }

    private function updateUserLocale($locale): void
    {
        $user = new User();
        $user->findone(['id = ?', [$this->session->get('user.id')]]);
        $user->locale = $locale;
        $user->save();
    }
}
