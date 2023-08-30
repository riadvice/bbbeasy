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

namespace Log;

use Monolog\Formatter\LineFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;

trait LogWriterTrait
{
    /**
     * Logger instance.
     *
     * @var Logger
     */
    protected $logger;

    public function initLogger(): void
    {
        $this->logger = new Logger(static::class);
        $level        = mb_strtoupper(\Base::instance()->get('log.level') ?: 'info');
        $class        = new \ReflectionClass('Monolog\Logger');
        $stream       = new StreamHandler(\Base::instance()->get('application.logfile'), $class->getConstants()[$level]);
        $stream->setFormatter(new LineFormatter('[' . (\Base::instance()->ip() ?: 'CLI:PID.' . getmypid()) . '] ' . "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\n", 'Y-m-d G:i:s.u'));
        $this->logger->pushHandler($stream);
    }
}
