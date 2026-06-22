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

namespace Actions\Core;

use Actions\Base as BaseAction;

/**
 * Class LocalesController.
 */
class GetLocale extends BaseAction
{
    /**
     * Loads a json translation files from cache or generates if it does not exist.
     *
     * @param \Base $f3
     * @param array $params
     */
    public function execute($f3, $params): void
    {
        $cache        = \Cache::instance();
        $localePrefix = 'locale.' . $params['locale'];

        // checking if the file is already cached, the cache locale file is generated from the file last modification time
        $cached = $cache->exists($hash = $localePrefix . '.' . $f3->hash(filemtime($f3['LOCALES'] . $params['locale'] . '.php') . $params['locale']));

        if (false === $cached) {
            // we create a new json file from locales data
            $cache->reset($localePrefix);
            $cache->set($hash, json_encode($f3['i18n']));
        }

        // @fixme: move to CDN and make the call lighter
        $this->logger->info('Loading locale: ' . $params['locale'], ['cached' => false !== $cached]);

        $this->renderJson($cache->get($hash));
    }
}
