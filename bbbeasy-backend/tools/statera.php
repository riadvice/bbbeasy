<?php

/**
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
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

use Application\Bootstrap;
use Core\Statera;
use Nette\Utils\Strings;

// load composer autoload, the paths are resolved from this file so the runner
// works whatever the current directory is
require_once dirname(__DIR__) . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';

// Change to application directory to execute the code
chdir(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'app');

// The environment is picked from the query string, populate it from the command
// line before the framework boots.
$argv[1] = $argv[1] ?? '/api?statera&test=all';
parse_str(Strings::after($argv[1], '?') ?: '', $_GET);

$GLOBALS['test_cli'] = PHP_SAPI === 'cli';

Statera::startCoverage('Application Bootstrapping');
$app = new Bootstrap();
Statera::stopCoverage();
$app->start();
