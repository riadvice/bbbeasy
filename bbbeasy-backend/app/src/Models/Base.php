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

namespace Models;

use Core\Session;
use DB\Cortex;
use Helpers\Time;
use Log\LogWriterTrait;

/**
 * Base Model Class.
 *
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 */
abstract class Base extends Cortex
{
    use LogWriterTrait;

    /**
     * f3 instance.
     *
     * @var \Base f3
     */
    protected $f3;

    /**
     * @var \Cache
     */
    protected $cache;

    /**
     * f3 instance.
     *
     * @var Session f3
     */
    protected $session;

    /**
     * Page size for list.
     *
     * @var int
     */
    protected $pageSize;

    /**
     * Base constructor. Initialises the model.
     *
     * @param null $db
     * @param null $table
     * @param null $fluid
     * @param int  $ttl
     */
    public function __construct($db = null, $table = null, $fluid = null, $ttl = 0)
    {
        $this->db = $db ?: \Registry::get('db');

        parent::__construct($this->db, $table, $fluid, $ttl);

        $this->f3       = \Base::instance();
        $this->cache    = \Cache::instance();
        $this->session  = \Registry::get('session');
        $this->pageSize = $this->f3->get('pagination.limit');
        $this->initLogger();

        $this->beforeinsert(static function(self $self): void {
            $self->setCreatedOnDate();
        });

        $this->beforeupdate(static function(self $self): void {
            $self->setUpdatedOnDate();
        });
    }

    /**
     * @param mixed $filter
     *
     * @return array
     */
    public function prepareFilter($filter)
    {
        return array_map(static fn ($value) => '' === $value ? '%' : '%' . $value . '%', $filter);
    }

    /**
     * Set page size value for pagination.
     *
     * @param int $pageSize
     */
    public function setPageSize($pageSize): void
    {
        $this->pageSize = $pageSize;
    }

    /**
     * Returns the last inserted id.
     */
    public function lastInsertId(): int
    {
        $id = $this->db->exec("SELECT MAX(id) as seq FROM {$this->table}");

        return $id[0]['seq'];
    }

    /**
     * Returns object converted to an array.
     *
     * @param int $depth
     */
    public function toArray($depth = 0): array
    {
        return $this->cast(null, $depth);
    }

    protected function setCreatedOnDate(): void
    {
        if (\in_array('created_on', $this->fields(), true)) {
            $this->created_on = Time::db();
        }
        if (method_exists($this, 'onCreateCleanUp')
            && \is_callable([$this, 'onCreateCleanUp'])) {
            \call_user_func(
                [$this, 'onCreateCleanUp']
            );
        }
    }

    protected function setUpdatedOnDate(): void
    {
        if (\in_array('updated_on', $this->fields(), true)) {
            $this->updated_on = Time::db();
        }
        if (method_exists($this, 'onUpdateCleanUp')
            && \is_callable([$this, 'onCreateCleanUp'])) {
            \call_user_func(
                [$this, 'onCreateCleanUp']
            );
        }
    }

    protected function toPostgreSqlArray($set): string
    {
        $set    = (array) $set;
        $result = [];

        foreach ($set as $t) {
            if (\is_array($t)) {
                $result[] = $this->toPostgreSqlArray($t);
            } else {
                $t = str_replace('"', '\\"', $t); // escape double quote
                if (!is_numeric($t)) { // quote only non-numeric values
                    $t = '"' . $t . '"';
                }
                $result[] = $t;
            }
        }

        return '{' . implode(',', $result) . '}'; // format
    }
}
