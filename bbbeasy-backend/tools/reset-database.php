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

use Symfony\Component\Yaml\Yaml;

require_once dirname(__DIR__) . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';

$environment = $argv[1] ?? 'testing';
$config      = Yaml::parseFile(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'phinx.yml');
$database    = $config['environments'][$environment] ?? null;

if (null === $database) {
    fwrite(STDERR, "Unknown phinx environment {$environment}." . PHP_EOL);

    exit(1);
}

// The suite is not transactional, every group leaves its fixtures behind. Wiping
// the schema is what makes a run repeatable.
$dsn = "pgsql:host={$database['host']};port={$database['port']};dbname={$database['name']}";
$pdo = new PDO($dsn, $database['user'], $database['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$pdo->exec('DROP SCHEMA public CASCADE');
$pdo->exec('CREATE SCHEMA public');

echo "Database {$database['name']} reset." . PHP_EOL;
