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

namespace Models;

use DateTime;
use DB\Cortex;
use Enum\UserStatus;
use Models\Base as BaseModel;

/**
 * Class User.
 *
 * @property int      $id
 * @property string   $email
 * @property int      $role_id
 * @property string   $username
 * @property string   $first_name
 * @property string   $last_name
 * @property string   $password
 * @property string   $status
 * @property string   $resetToken
 * @property DateTime $created_on
 * @property DateTime $updated_on
 * @property DateTime $last_login
 */
class User extends BaseModel
{
    protected $fieldConf = [
        'role_id' => [
            'belongs-to-one' => Role::class,
        ],
    ];

    protected $table = 'users';

    public function __construct($db = null, $table = null, $fluid = null, $ttl = 0)
    {
        parent::__construct($db, $table, $fluid, $ttl);
        $this->onset('password', fn($self, $value) => password_hash($value, PASSWORD_BCRYPT));
    }

    /**
     * Get user record by email value.
     *
     * @param string $email
     */
    public function getByEmail($email): self
    {
        $this->load(['lower(email) = ?', mb_strtolower($email)]);

        return $this;
    }

    /**
     * Get user record by id value.
     *
     * @param int $id
     *
     * @return Cortex
     */
    public function getById($id): self
    {
        $this->load(['id = ?', $id]);

        return $this;
    }

    /**
     * Check if email already in use.
     *
     * @param string $email
     *
     * @return bool
     */
    public function emailExists($email)
    {
        return $this->load(['email = ?', $email]);
    }

    // @todo: will be used to detect if the course is full or not yet
    /**
     * @param $ids
     *
     * @return int
     */
    public function countActiveUsers($ids)
    {
        $result = $this->db->exec(
            'SELECT COUNT(us.id) AS total
             FROM users AS us
             WHERE (us.status= ?) AND (us.id IN ("' . implode('","', $ids) . '"))',
            [UserStatus::ACTIVE]
        );

        return (int) $result[0]['total'];
    }

    /**
     * @return mixed
     */
    public function getCountFields()
    {
        return $this->countFields;
    }

    public function verifyPassword($password): bool
    {
        return password_verify(trim($password), $this->password);
    }
}
