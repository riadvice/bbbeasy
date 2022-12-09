<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateRoomsLabelsTable extends AbstractMigration
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
        $table = $this->table('rooms_labels');
        $table->addColumn('room_id', 'integer', ['null' => true])
            ->addColumn('label_id', 'integer', ['null' => true])

            ->addColumn('created_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addColumn('updated_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])

            ->addForeignKey(['room_id'], 'rooms', ['id'], ['constraint' => 'room_rooms_labels_id'])
            ->addForeignKey(['label_id'], 'labels', ['id'], ['constraint' => 'label_rooms_labels_id'])

            ->save();
    }
}
