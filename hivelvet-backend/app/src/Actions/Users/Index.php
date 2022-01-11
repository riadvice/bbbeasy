<?php

/**
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
use Base;

/**
 * Class Index
 * @package Actions\Users
 */
class Index extends BaseAction
{
    /**
     * @param Base  $f3
     * @param array $params
     */
    public function show($f3, $params): void
    {
        $this->assets->addJs('core.js');
        $this->assets->addJs('core/users.js');
        $this->assets->addJs('vendors/datatables.min.js');
        $this->assets->addCss('datatables.min.css');
        $f3->push('init.js', 'Users');

        $this->render();
    }

    /**
     * @param Base  $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        $user    = new User();
    }
}
