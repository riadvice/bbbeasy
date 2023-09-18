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

use Enum\ResponseCode;
use Enum\UserRole;
use Enum\UserStatus;
use Models\Base as BaseModel;

/**
 * Class User.
 *
 * @property int       $id
 * @property string    $email
 * @property int       $role_id
 * @property Role      $role
 * @property string    $username
 * @property string    $first_name
 * @property string    $last_name
 * @property string    $password
 * @property string    $status
 * @property string    $avatar
 * @property string    $resetToken
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 * @property \DateTime $last_login
 * @property int       $password_attempts
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
        $this->onset('password', static fn ($self, $value) => password_hash($value, PASSWORD_BCRYPT));
        $this->virtual('role', fn () => $this->role_id);
    }

    /**
     * Get user record by email value.
     *
     * @return $this
     */
    public function getByEmail(string $email): self
    {
        $this->load(['lower(email) = ?', mb_strtolower($email)]);

        return $this;
    }

    /**
     * Get user record by id value.
     *
     * @param mixed $id
     *
     * @return $this
     */
    public function getById($id): self
    {
        $this->load(['id = ?', $id]);

        return $this;
    }

    /**
     * Check if admin account already exists.
     */
    public function adminUserExists(): bool
    {
        return $this->load(['role_id = ?', UserRole::ADMINISTRATOR_ID]);
    }

    /**
     * Check if email already in use.
     *
     * @param null|mixed $id
     */
    public function emailExists(string $email, $id = null): bool
    {
        return $this->load(['lower(email) = ? and id != ?', mb_strtolower($email), $id]);
    }

    /**
     * Check if username already in use.
     *
     * @param null|mixed $id
     */
    public function usernameExists(string $username, $id = null): bool
    {
        return $this->load(['lower(username) = ? and  id != ?', mb_strtolower($username), $id]);
    }

    public function getUsers($username, $email)
    {
        $data  = [];
        $users = $this->find(['username !=  ? and email != ? ', $username, $email]);
        if ($users) {
            $data = $users->castAll(['username', 'email', 'password']);
        }

        return $data;
    }

    /**
     * Check if email or username already in use.
     *
     * @param null|mixed $id
     */
    public function getUsersByUsernameOrEmail(string $username, string $email, $id = null): array
    {
        $data = [];

        $users = $this->find(['(username = lower(?) and id != ?) or (email = lower(?) and id != ?)', $username, $id, $email, $id]);
        if ($users) {
            $data = $users->castAll(['username', 'email']);
        }

        return $data;
    }

    /**
     * Check if user infos already in use.
     *
     * @param mixed $users
     */
    public function userExists(string $username, string $email, array $users): ?string
    {
        if ($users) {
            if (1 === \count($users)) {
                $usernameExist = mb_strtolower($users[0]['username']) === mb_strtolower($username);
                $emailExist    = mb_strtolower($users[0]['email']) === mb_strtolower($email);

                if ($usernameExist && $emailExist) {
                    $errorMessage = 'Username and Email already exist';
                } elseif ($usernameExist) {
                    $errorMessage = 'Username already exists';
                } else {
                    $errorMessage = 'Email already exists';
                }

                return $errorMessage;
            }

            return 'Username and Email already exist';
        }

        return null;
    }

    // @todo: will be used to detect if the course is full or not yet

    public function countActiveUsers(array $ids = null): int
    {
        $subQuery = '';

        if (null !== $ids) {
            if (1 === \count($ids)) {
                $subQuery = 'AND (us.id =' . $ids[0] . ')';
            } else {
                $subQuery = 'AND (us.id IN (' . implode(',', $ids) . '))';
            }
        }

        $result = $this->db->exec(
            'SELECT COUNT(us.id) AS total
             FROM users AS us
             WHERE (us.status = ?) ' . $subQuery,
            [UserStatus::ACTIVE]
        );

        return (int) $result[0]['total'];
    }

    public function verifyPassword($password): bool
    {
        return password_verify(trim($password), $this->password);
    }

    public function getAllUsers(): array
    {
        $data  = [];
        $users = $this->find([], ['order' => 'id']);
        if ($users) {
            foreach ($users as $user) {
                $data[] = $user->getUserInfos();
            }
        }

        return $data;
    }

    public function getUserInfos(): array
    {
        $room = new Room();

        return [
            'key'      => $this->id,
            'username' => $this->username,
            'email'    => $this->email,
            'status'   => $this->status,
            'role'     => $this->role_id->name,
            'nb_rooms' => \count($room->collectAllByUserId($this->id)),
        ];
    }

    public function saveUserWithDefaultPreset($username, $email, $password, $roleId, $successMessage, $errorMessage): bool|string
    {
        try {
            $this->username          = $username;
            $this->email             = $email;
            $this->password          = $password;
            $this->role_id           = $roleId;
            $this->status            = UserStatus::PENDING;
            $this->password_attempts = 3;

            $this->save();
            $this->getById($this->lastInsertId());
        } catch (\Exception $e) {
            $this->logger->error($errorMessage, ['user' => $this->toArray(), 'error' => $e->getMessage()]);

            return false;
        }

        $this->logger->info($successMessage, ['user' => $this->toArray()]);

        return $this->saveDefaultPreset($userId);
    }

    public function saveDefaultPreset($userId, $returnPreset = null): bool|string|Preset
    {
        $preset       = new Preset();
        $preset->name = 'default';

        $preset->user_id = $userId;

        $presetErrorMessage   = 'Default preset could not be added';
        $presetSuccessMessage = 'Default preset successfully added';
        $result               = $preset->addDefaultSettings($presetSuccessMessage, $presetErrorMessage);

        if (true === $returnPreset) {
            return $preset;
        }

        return $result ? true : $result;
    }

    /**
     * Delete a user by setting its status to "deleted".
     *
     * @return Array[2](Array[], ResponsCode)
     */
    public function delete(): array
    {
        $this->status = UserStatus::DELETED;

        try {
            $this->save();
            $this->logger->info('User successfully deleted', ['user' => $this->toArray()]);
        } catch (\Exception $e) {
            $this->logger->error('User could not be deleted', ['user' => $this->toArray(), 'error' => $e->getMessage()]);

            throw $e;
        }

        return [['result' => 'success', 'user' => $this->getUserInfos()], ResponseCode::HTTP_OK];
    }
}
