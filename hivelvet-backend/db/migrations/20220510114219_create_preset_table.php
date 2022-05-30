<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreatePresetTable extends AbstractMigration
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

        public function up(): void
    {
        $table = $this->table('presets');
        $table
             ->addColumn('name', 'string', ['limit' => 64, 'null' => false])
              ->addColumn('created_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addColumn('updated_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addIndex('name', ['unique' => true, 'name' => 'idx_presets_name'])
            ->save()
        ;
    }

        public function down(): void
    {
        $this->table('presets')->drop()->save();
    }

}
