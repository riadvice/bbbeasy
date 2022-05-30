<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreatePresetCategoryTable extends AbstractMigration
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
        $table = $this->table('preset_categories');
        $table
            ->addColumn('name', 'string', ['limit' => 64, 'null' => false])
            ->addColumn('enabled','boolean', ['default' => false, 'null' => false])
            ->addColumn('icon',"string",["null"=>true])
            ->addColumn('preset_id', 'integer', ['null' => false])
            ->addColumn('created_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addColumn('updated_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addForeignKey(['preset_id'], 'presets', ['id'], ['constraint' => 'presets_id'])
            ->addIndex('name', ['unique' => true, 'name' => 'idx_preset_categories_name'])
            ->save()
        ;
    }
    public function down(): void
    {
        $this->table('preset_categories')->drop()->save();
    }
}
