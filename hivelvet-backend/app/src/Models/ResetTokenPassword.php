<?php

namespace Models;

use Enum\CacheKey;
use Models\Base as BaseModel;
use DB\Cortex;

/**
 * Class User
 * @property int   $id
 * @property int $userID
 * @property string $token
 * @property string    $status
 * @property date $expirationDate


 * @package Models
 */
class ResetTokenPassword extends BaseModel
{
    protected $table = 'reset_password_tokens';
    public function onCreateCleanUp(): void
    {
        $this->f3->clear(CacheKey::AJAX_USERS);
    }

    public function onUpdateCleanUp(): void
    {
        $this->f3->clear(CacheKey::AJAX_USERS);
    }

    public function __construct($db = null, $table = null, $fluid = null, $ttl = 0)
    {
        parent::__construct($db, $table, $fluid, $ttl);
    }

    /**
     * Check if USER id already in use
     *
     * @param  integer $userID
     * @return bool
     */
    public function userExists($userID)
    {
        return count($this->db->exec('SELECT 1 FROM reset_password_tokens WHERE "userID"= ?', $userID)) > 0;
    }

    /**
     * Check if token already exists
     *
     * @param  string $token
     * @return bool
     */
    public function tokenExists(string $token)
    {
        return count($this->db->exec('SELECT 1 FROM reset_password_tokens WHERE "token"= ?', $token)) > 0;
    }
    /**
     * Get user record by userID value
     *
     * @param  integer $userID
     * @return Cortex
     */
    public function getByUserID(int $userID)
    {
        $this->load(['userID = ?', $userID]);

        return $this;
    }

    /**
     * Get user record by token value
     *
     * @param  string $token
     * @return Cortex
     */
    public function getByToken(string $token)
    {
        $this->load(['token = ?', $token]);

        return $this;
    }
}
