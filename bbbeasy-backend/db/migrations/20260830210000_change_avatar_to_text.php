<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ChangeAvatarToText extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('users');
        $table->changeColumn('avatar', 'text', ['null' => true])->save();
    }
}
