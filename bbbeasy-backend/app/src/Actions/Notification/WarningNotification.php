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
use Enum\ResponseCode;
use Sukarix\Behaviours\LogWriter;

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
     * The server and the shared secret must both be set and both be moved away
     * from the values shipped in the default configuration.
     */
    private function bigBlueButtonIsConfigured(): bool
    {
        $defaults = [
            'unsecure_server_to_change_immediately',
            'unsecure_shared_secret_to_change_immediately',
        ];

        $server = mb_trim((string) $this->f3->get('bbb.server'));
        $secret = mb_trim((string) $this->f3->get('bbb.shared_secret'));

        foreach ([$server, $secret] as $value) {
            if ('' === $value || \in_array($value, $defaults, true)) {
                return false;
            }
        }

        return true;
    }
}
