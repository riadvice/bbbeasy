<?php

/**
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

use Base;
use Enum\BBBApiParams;
use Nette\Utils\Strings;

class URLUtils
{

    /**
     * @param $apiCall
     * @param $data
     * @param $checksumLength
     * @param $sharedSecret
     * @return string
     */
    public static function calculateChecksum($apiCall, $data, $checksumLength, $sharedSecret): string
    {
        $queryString = self::convertIncomingQuery($data);

        return hash($checksumLength !== 64 ? 'sha1' : 'sha256', $apiCall . $queryString . $sharedSecret);
    }

    /**
     * @param $apiCall
     * @param $queryString
     * @param $checksumLength
     * @param $sharedSecret
     * @return string
     */
    public static function calculateOutgoingChecksum($apiCall, $queryString, $checksumLength, $sharedSecret): string
    {
        return hash($checksumLength !== 64 ? 'sha1' : 'sha256', $apiCall . $queryString . $sharedSecret);
    }

    /**
     * @return string
     */
    public static function convertIncomingQuery($requestData): string
    {
        unset($requestData[BBBApiParams::CHECKSUM]);
        // rebuild the HTTP query without teh checksum
        $value = http_build_query($requestData, '', '&');
        $value = str_replace('%20', '+', $value);
        // $value = str_replace('%2B', '+', $value);
        // Some integrations start their query with &, we need to add it back for the checksum calculation
        // even if it is removed later by the load balancer
        return Strings::startsWith(Base::instance()->get('QUERY'), '&') ? '&' . $value : $value;
    }

    /**
     * @param $data
     * @return string
     */
    public static function convertOutgoingQuery($data): string
    {
        $query = http_build_query($data, '', '&');
        $query = str_replace('!', '%21', $query);
        $query = str_replace('*', '%2A', $query);
        $query = str_replace('%20', '+', $query);
        // $query = str_replace('%2B', '+', $query);

        return $query;
    }
}
