<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateSubCategoryTable extends AbstractMigration
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
        $table = $this->table('subcategories');
        $table
            ->addColumn('name', 'string', ['limit' => 64, 'null' => true])
            ->addColumn('type','string',['null'=>true])
            ->addColumn('category_id', 'integer', ['null' => false])
            ->addForeignKey(['category_id'], 'preset_categories', ['id'], ['constraint' => 'preset_category_id'])
            ->save()
        ;
    }
    public function down(): void
    {
        $this->table('subcategories')->drop()->save();
    }
}
