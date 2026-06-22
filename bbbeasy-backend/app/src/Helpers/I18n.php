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

namespace Helpers;

use Helpers\Base as BaseHelper;

/**
 * Localisation Helper Class.
 */
class I18n extends BaseHelper
{
    /**
     * Get a i18n label.
     *
     * @param mixed $key
     *
     * @return string
     */
    public function lbl($key)
    {
        return $this->f3->get('i18n.label.' . $key);
    }

    /**
     * Get a i18n message.
     *
     * @param mixed $key
     *
     * @return string
     */
    public function msg($key)
    {
        return $this->f3->get('i18n.message.' . $key);
    }

    /**
     * Get a i18n error.
     *
     * @param mixed $key
     *
     * @return string
     */
    public function err($key)
    {
        return $this->f3->get('i18n.error.' . $key);
    }

    /**
     * Get a i18n list.
     *
     * @param mixed $key
     *
     * @return array
     */
    public function lst($key)
    {
        return $this->f3->get('i18n.list.' . $key);
    }
}
