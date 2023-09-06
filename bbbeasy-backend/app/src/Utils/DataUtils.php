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

namespace Utils;

class DataUtils
{
    public static function keepIntegerInArray(&$array): void
    {
        if (null !== $array) {
            array_filter($array, 'ctype_digit');
        }
    }

    /**
     * Unsets an array item by its value.
     *
     * @param mixed $array
     * @param mixed $value
     */
    public static function unsetByValue(&$array, $value): void
    {
        if (($key = array_search($value, $array, true)) !== false) {
            unset($array[$key]);
        }
    }

    /**
     * Returns a the key of the array as an array.
     *
     * @param mixed $array
     * @param mixed $key
     *
     * @return array
     */
    public static function getArrayFromField($array, $key)
    {
        return array_map(static fn ($item) => $item[$key], $array);
    }

    /**
     * @param false $stringData
     * @param mixed $array
     *
     * @return string
     */
    public static function toJsonArray($array, $stringData = false)
    {
        if (!$stringData) {
            return implode(',', $array);
        }

        return "'" . implode("','", $array) . "'";
    }

    public static function validateImageFormat(string $fileName, ?array $formats = null)
    {
        $validFormats = $formats ?? ['jpg', 'jpeg', 'png'];
        $imageFormat  = str_contains($fileName, '.') ? mb_substr($fileName, mb_strpos($fileName, '.') + 1) : $fileName;

        return \in_array($imageFormat, $validFormats, true);
    }

    /**
     * @param int $length
     *
     * @return string
     */
    public static function generateRandomString($length = 8)
    {
        return bin2hex(openssl_random_pseudo_bytes($length));
    }
}
