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

namespace Utils;

use Actions\Base as BaseAction;
use BigBlueButton\BigBlueButton;
use Log\LogWriterTrait;

class BigBlueButtonRequester extends BigBlueButton
{
    use LogWriterTrait;

    private const BBB_PATH = '/bigbluebutton/';

    /**
     * f3 instance.
     *
     * @var \Base f3
     */
    protected $f3;

    /**
     * The name of the call api method name.
     *
     * @var string
     */
    protected $apiCall;

    /**
     * initialize controller.
     */
    public function __construct()
    {
        BigBlueButton::__construct();

        $this->f3 = \Base::instance();
        $this->initLogger();

        $this->apiCall = basename(\Base::instance()->get('PATH'));
    }

    /**
     * @return null|array|bool|false
     */
    public function proxyApiRequest(string $path, string $params, string $verb, bool $redirect = false)
    {
        $options    = ['method' => $verb];
        $serverUrl  = $this->f3->get('bbb.server');
        $bbbBaseUrl = '/bigbluebutton/api/';

        $url = $serverUrl . $bbbBaseUrl . $path . '?' . $params;

        if ('POST' === $verb) {
            $options['content'] = $this->f3->get('BODY');
            $options['header']  = BaseAction::APPLICATION_XML;
        }

        $this->logger->info('Forwarding the BigBlueButton request to server.', ['verb' => $verb, 'path' => $path]);

        if ($redirect) {
            return $this->f3->reroute($url);
        }

        return \Web::instance()->request($url, $options);
    }

    public function isValidResponse(array $result): bool
    {
        return !empty($result['body']);
    }
}
