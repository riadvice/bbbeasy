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

namespace Actions\PresetSettings;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\GuestPolicy;
use Enum\ResponseCode;
use Models\Preset;
use Models\PresetSetting;

class Edit extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $body         = $this->getDecodedBody();
        $form         = $body['data'];
        $categoryName = $body['category'];

        $presetSetting = new PresetSetting();
        $settings      = $presetSetting->find(['group = ?', $categoryName], ['order' => 'id']);

        if (!$settings) {
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);

            return;
        }

        // The form carries one entry per setting of the category, matching them by
        // name rather than by position keeps it working whatever order they arrive in.
        $enabled = array_column($form, 'enabled', 'name');

        foreach ($settings as $setting) {
            if (\array_key_exists($setting->name, $enabled)) {
                $setting->enabled = $enabled[$setting->name];
                $setting->save();
            }
        }

        $errorMessage = 'User Preset could not be updated';

        foreach (new Preset()->find() ?: [] as $userPreset) {
            $categories = json_decode((string) $userPreset['settings']);

            if (!\is_object($categories) || !property_exists($categories, $categoryName)) {
                continue;
            }

            $userPreset['settings'] = json_encode($this->applyToPreset($categories, $categoryName, $enabled));

            try {
                $userPreset->save();
            } catch (\Exception $e) {
                $this->logger->error($errorMessage, ['preset' => $userPreset->toArray(), 'error' => $e->getMessage()]);
                $this->renderJson(['errors' => $errorMessage], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }
        }

        $this->renderJson(['result' => 'success', 'settings' => $presetSetting->getCategoryInfos($categoryName)]);
    }

    /**
     * Add the settings that were switched on to one preset category and drop the ones
     * that were switched off. A category left without a single setting reads as
     * disabled, which the presets store as the string null.
     */
    protected function applyToPreset(object $categories, string $categoryName, array $enabled): object
    {
        $subCategories = (array) json_decode((string) $categories->{$categoryName});

        foreach ($enabled as $name => $isEnabled) {
            if (!$isEnabled) {
                unset($subCategories[$name]);

                continue;
            }

            if (!\array_key_exists($name, $subCategories)) {
                $subCategories[$name] = \Enum\Presets\GuestPolicy::POLICY === $name ? GuestPolicy::ALWAYS_ACCEPT : '';
            }
        }

        $categories->{$categoryName} = [] === $subCategories ? 'null' : json_encode((object) $subCategories);

        return $categories;
    }
}
