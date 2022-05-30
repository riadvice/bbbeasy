<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateSubCategoryPresetTable extends AbstractMigration
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
        $table = $this->table('preset_subcategories');
        $table

           ->addColumn("data","json",['null'=>false])
            ->addColumn('sub_category_id', 'integer', ['null' => false])
            ->addColumn('preset_id', 'integer', ['null' => false])
            ->addForeignKey(['sub_category_id'], 'subcategories', ['id'], ['constraint' => 'preset_category_id'])
            ->addForeignKey(['preset_id'], 'presets', ['id'], [ 'delete' => 'CASCADE', 'constraint' => 'preset_subcategory_id'])
            ->save()
        ;
    }
    public function down(): void
    {
        $this->table('preset_subcategories')->drop()->save();
    }
}
