<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class RoomPresentations extends AbstractMigration
{
    public function up(): void
    {
        $table = $this->table('room_presentations');
        $table->addColumn('file_name', 'string', ['limit' => 100, 'null' => false])
            ->addColumn('room_id', 'integer', ['null' => false])
            ->addColumn('created_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addColumn('updated_on', 'datetime', ['default' => '0001-01-01 00:00:00', 'timezone' => true])
            ->addIndex('file_name', ['unique' => true, 'name' => 'idx_presets_name'])
            ->addForeignKey(['room_id'], 'rooms', ['id'], ['constraint' => 'rooms_id'])
            ->save()
        ;
    }

    public function down(): void
    {
        $this->table('room_presentations')->drop()->save();
    }
}
