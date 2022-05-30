<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreatePresetSubCategoryTable extends AbstractMigration
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
        $table = $this->table('preset_subcategories');
        $table
            //->addColumn('name', 'string', ['limit' => 64, 'null' => false])
            ->addColumn("data","json",['null'=>false])
            /*->addColumn('type',string,['null'=> false])
            ->addColumn('value')
            ->addColumn('enabled','boolean', ['default' => false, 'null' => false])*/
            ->addColumn('category_id', 'integer', ['null' => false])
            ->addColumn('created_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addColumn('updated_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addForeignKey(['category_id'], 'preset_categories', ['id'], ['constraint' => 'preset_category_id'])
            ->addIndex('name', ['unique' => true, 'name' => 'idx_preset_sub_categories_name'])
            ->save()
        ;
    }
    public function down(): void
    {
        $this->table('preset_subcategories')->drop()->save();
    }
}
