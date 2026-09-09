<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with BBBeasy. If not, see <https://www.gnu.org/licenses/>
 */

use Phinx\Migration\AbstractMigration;

/**
 * Only the installer used to fill the preset settings, so an instance deployed
 * from the migrations alone had an empty BigBlueButton settings page and rooms
 * that nobody could join.
 */
final class SeedDefaultPresetSettings extends AbstractMigration
{
    /**
     * Settings enabled out of the box, so a fresh installation can host a meeting
     * that guests are able to join without any further configuration.
     */
    private const ENABLED = [
        'anyone_can_start',
        'open_for_everyone',
        'duration',
        'maximum_participants',
        'welcome',
        'users_join_muted',
        'moderators_allowed_to_unmute_users',
        'record',
        'allow_start_stop',
    ];

    public function up(): void
    {
        $existing = $this->fetchRow('SELECT COUNT(*) AS total FROM preset_settings');
        if ((int) $existing['total'] > 0) {
            return;
        }

        $rows = [];
        foreach ($this->presetGroups() as $group => $settings) {
            foreach ($settings as $setting) {
                $rows[] = [
                    'group'      => $group,
                    'name'       => $setting,
                    'enabled'    => 'Layout' === $group || in_array($setting, self::ENABLED, true),
                    'created_on' => date('Y-m-d H:i:s'),
                ];
            }
        }

        if ([] !== $rows) {
            $this->table('preset_settings')->insert($rows)->saveData();
        }
    }

    public function down(): void
    {
        $this->execute('DELETE FROM preset_settings');
    }

    /**
     * Read the settings of every preset group from its enumeration class, the
     * constants suffixed with _TYPE only describe the value type.
     *
     * @return array<string, string[]>
     */
    private function presetGroups(): array
    {
        $groups    = [];
        $directory = __DIR__ . '/../../app/src/Enum/Presets';

        foreach (glob($directory . '/*.php') ?: [] as $file) {
            $class = 'Enum\Presets\\' . basename($file, '.php');
            if (!class_exists($class)) {
                continue;
            }

            $reflection = new ReflectionClass($class);
            $constants  = $reflection->getConstants();
            if (!isset($constants['GROUP_NAME'])) {
                continue;
            }

            $settings = [];
            foreach ($constants as $name => $value) {
                if ('GROUP_NAME' !== $name && !str_ends_with($name, '_TYPE')) {
                    $settings[] = $value;
                }
            }

            $groups[$constants['GROUP_NAME']] = $settings;
        }

        return $groups;
    }
}
