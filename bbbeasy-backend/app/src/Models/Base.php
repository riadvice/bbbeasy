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

namespace Models;

use DB\CortexCollection;
use Sukarix\Models\Model;

/**
 * Base Model Class.
 *
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 */
abstract class Base extends Model
{
    /**
     * Narrow what a query returns.
     *
     * Cortex documents find() as returning an array of records, it returns a
     * CortexCollection, and callers use the collection methods the array does
     * not have.
     *
     * @param null|array $filter
     * @param null|array $options
     * @param int        $ttl
     *
     * @return CortexCollection|false
     */
    public function find($filter = null, ?array $options = null, $ttl = 0)
    {
        return parent::find($filter, $options, $ttl);
    }

    /**
     * Reload the record after an insert.
     *
     * PostgreSQL identity columns carry no nextval default, so Fat-Free does not
     * recognise them as auto increment. The reload it runs itself after an insert
     * then filters on the identifier the record had before the insert, matches
     * nothing and leaves the whole record blank in memory, defaults included.
     *
     * @return mixed
     */
    public function insert()
    {
        $result = parent::insert();

        $id = $this->mapper->get('_id');
        if (!$this->valid() && $id) {
            $this->load(['id = ?', $id]);
        }

        return $result;
    }

    /**
     * Add an identifier exclusion to a filter. Comparing to a null identifier
     * never matches in SQL and would silently disable the whole filter, which
     * makes every uniqueness check pass while creating a record.
     *
     * @param null|mixed $id
     */
    public function excludeId(array $filter, $id = null): array
    {
        if (null === $id) {
            return $filter;
        }

        $filter[0] = '(' . $filter[0] . ') and id != ?';
        $filter[]  = $id;

        return $filter;
    }
}
