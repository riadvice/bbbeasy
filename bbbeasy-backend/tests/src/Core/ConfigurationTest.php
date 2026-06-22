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

namespace Core;

use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class ConfigurationTest extends Scenario
{
    protected $group = 'Framework & Server Configuration';

    /**
     * @param $f3 \Base
     *
     * @return array
     */
    public function testDefaultConfiguration($f3)
    {
        $test = $this->newTest();
        $test->expect('Africa/Tunis' === date_default_timezone_get(), 'Timezone set to Africa/Tunis');
        $test->expect('UTF-8' === \ini_get('default_charset'), 'Default charset is UTF-8');
        $test->expect('../logs/' === $f3->get('LOGS'), 'Logs folder correctly configured to "logs"');
        $test->expect('../tmp/' === $f3->get('TEMP'), 'Cache folder correctly configured to "tmp/cache/"');
        $test->expect(str_starts_with($f3->get('UI'), 'templates/;../public/;'), 'Templates folder correctly configured to "templates" and "public"');
        $test->expect('en-GB' === $f3->get('FALLBACK'), 'Fallback language set to en-GB');
        $test->expect('pgsql' === $f3->get('db.driver'), 'Using PostgreSQL database for session storage');
        $test->expect($f3->get('application.logfile') === '../logs/' . (\PHP_SAPI !== 'cli' ? 'app' : 'cli') . '-' . date('Y-m-d') . '.log', 'Log file name set to daily rotation app-' . date('Y-m-d') . '.log');

        return $test->results();
    }
}
