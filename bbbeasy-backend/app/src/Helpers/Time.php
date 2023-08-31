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

namespace Helpers;

use DateTime;

/**
 * Time and Date Helper Class.
 */
class Time
{
    /**
     * format a database-specific date/time string.
     *
     * @param \DateTime|int|string $unixTime (optional) the unix time (null = now)
     * @param null|string          $dbms     (optional) the database software the timestamp is for
     *
     * @return bool|string date in format of database driver
     *
     * @throws \Exception
     *
     * @todo add a switch for the f3 database driver and set the timestamp
     */
    public static function db(\DateTime|int|string $unixTime = null, string $dbms = null): bool|string
    {
        // use current time if bad time value or unset
        if (\is_string($unixTime)) {
            $date     = new \DateTime($unixTime);
            $unixTime = $date->getTimestamp();
        } elseif ($unixTime instanceof \DateTime) {
            $unixTime = $unixTime->getTimestamp();
        }
        $unixTime = (int) $unixTime;
        if ($unixTime <= 0) {
            $unixTime = time();
        }

        // format date/time according to database driver
        $dbms = empty($dbms) ? \Base::instance()->get('db.driver') : $dbms;

        return match ($dbms) {
            'pgsql', 'mysql' => date('Y-m-d H:i:s', $unixTime),
        };
    }

    /**
     * Utility to convert timestamp into a http header date/time.
     *
     * @param int    $unixtime time php time value
     * @param string $zone     timezone, default GMT
     *
     * @return string
     */
    public static function http($unixtime = null, $zone = 'GMT')
    {
        // use current time if bad time value or unset
        $unixtime = (int) $unixtime;
        if ($unixtime <= 0) {
            $unixtime = time();
        }

        // if its not a 3 letter timezone set it to GMT
        $zone = 3 !== mb_strlen($zone) ? 'GMT' : mb_strtoupper($zone);

        return gmdate('D, d M Y H:i:s', $unixtime) . ' ' . $zone;
    }

    public static function formattedTime($dateTime = null): array
    {
        $formatTime = ' G:i';
        $dateMonth  = lcfirst(date('F', strtotime($dateTime)));
        $dateYear   = lcfirst(date(' j, Y ', strtotime($dateTime)));
        $time       = date($formatTime, strtotime($dateTime));

        return [$dateMonth, $dateYear, $time];
    }

    /**
     * Check if a particular DateTime is prior to now.
     *
     * @param mixed $dateTime
     *
     * @throws \Exception
     */
    public static function isInPast($dateTime): bool
    {
        return new \DateTime($dateTime) < new \DateTime();
    }
}
