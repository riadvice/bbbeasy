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

use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class SetLocaleTest extends Scenario
{
    protected $group = 'Action SetLocale';

    /**
     * @param $f3 \Base
     *
     * @return array
     */
    public function testSetLocale($f3)
    {
        $test = $this->newTest();
        $f3->mock('PUT /set-locale/en-GB [ajax]');

        json_decode($f3->get('RESPONSE'));

        $test->expect(JSON_ERROR_NONE === json_last_error(), 'Locale updated successfully without errors');

        return $test->results();
    }
}
