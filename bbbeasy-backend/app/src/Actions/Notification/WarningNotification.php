<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

namespace Actions\Notification;

use Actions\Base as BaseAction;
use Sukarix\Behaviours\LogWriter;
use Utils\BigBlueButtonRequester;

/**
 * Reports the BigBlueButton configuration status to the web application.
 */
class WarningNotification extends BaseAction
{
    use LogWriter;

    /**
     * Report whether this installation is connected to a BigBlueButton server.
     *
     * @param \Base $f3
     * @param array $params
     *
     * @throws \Exception
     */
    public function execute($f3, $params): void
    {
        $configured = $this->bigBlueButtonIsConfigured();

        if (!$configured) {
            $this->logger->warning('BigBlueButton API is not configured');
        }

        $this->renderJson(['configured' => $configured]);
    }

    /**
     * The installation counts as configured only when the BigBlueButton server
     * actually answers with the configured shared secret, a sample value left in
     * place is as useless to the user as an empty one. The answer is cached, the
     * web application asks for it on every page load.
     */
    private function bigBlueButtonIsConfigured(): bool
    {
        if ('' === mb_trim((string) $this->f3->get('bbb.server')) || '' === mb_trim((string) $this->f3->get('bbb.shared_secret'))) {
            return false;
        }

        $cacheKey = 'bbb.configured';
        $cache    = \Cache::instance();
        if ($cache->exists($cacheKey, $cached)) {
            return (bool) $cached;
        }

        try {
            $configured = new BigBlueButtonRequester()->getApiVersion()->success();
        } catch (\Throwable $throwable) {
            $this->logger->warning('BigBlueButton server could not be reached', ['error' => $throwable->getMessage()]);
            $configured = false;
        }

        $cache->set($cacheKey, $configured, $configured ? 300 : 60);

        return $configured;
    }
}
