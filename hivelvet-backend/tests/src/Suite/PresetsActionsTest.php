<?php

declare(strict_types=1);

/*
 * Hivelvet open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
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

namespace Suite;

use Actions\Presets\AddTest;
use Actions\Presets\DeleteTest;
use Actions\Presets\EditTest;
use Actions\Presets\IndexTest;
use Test\TestGroup;

/**
 * @internal
 *
 * @coversNothing
 */
final class PresetsActionsTest extends TestGroup
{
    protected $classes = [AddTest::class, EditTest::class, DeleteTest::class, IndexTest::class];

    protected $quiet = true;
}
