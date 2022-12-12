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

namespace Actions\Users;

use Test\Scenario;

/**
 * @internal
 *
 * @coversNothing
 */
final class IndexTest extends Scenario
{
    final protected const INDEX_USER_ROUTE = 'GET /users';
    protected $group                       = 'Action User Index';

    /**
     * @param mixed $f3
     *
     * @return array
     *
     * @throws \ReflectionException
     */
    public function testGetAll($f3)
    {
        $test = $this->newTest();
        $f3->mock(self::INDEX_USER_ROUTE);

        json_decode($f3->get('RESPONSE'));
        $test->expect(JSON_ERROR_NONE === json_last_error(), 'Get all roles informations');

        return $test->results();
    }
}
