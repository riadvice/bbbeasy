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

namespace Actions\Notification;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Log\LogWriterTrait;

/**
 * Class Start.
 */
class WarningNotification extends BaseAction
{
    use LogWriterTrait;

    /**
     * @param \Base $f3
     * @param array $params
     *
     * @throws \Exception
     */
    public function execute($f3, $params): void
    {
        $default_shared_secret = 'unsecure_shared_secret_to_change_immediately';
        $default_server        = 'unsecure_server_to_change_immediately';
        $bbbServer             = $this->f3->get('bbb.server');
        $bbbSharedSecret       = $this->f3->get('bbb.shared_secret');
        $errorMessage          = 'BigBlueButton API configured';
        if ($default_server === $bbbServer && $default_shared_secret === $bbbSharedSecret) {
            $this->logger->info('BigBlueButton API is not configured');
            $this->renderJson(['result' => 'configuration warning']);
        } else {
            $this->logger->error($errorMessage);
            $this->renderJson([$errorMessage], ResponseCode::HTTP_BAD_REQUEST);
        }
    }
}
