<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateResetPasswordTokenTable extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change(): void
    {
        $table = $this->table('reset_password_tokens');
        $table
            ->addColumn('user_id', 'integer', ['null'=> false])
            ->addColumn('token', 'string', [  'null' => false])
            ->addColumn('status', 'string', [  'null' => false])
            ->addColumn('expires_at', 'datetime', ['null' => false, 'timezone' => true] )
            ->addForeignKey(['user_id'], 'users', ['id'], ['constraint' => 'users_id'])
            ->addIndex('token', ['unique' => true, 'name' => 'idx_reset_tokens'])

            ->create();
    }
}
