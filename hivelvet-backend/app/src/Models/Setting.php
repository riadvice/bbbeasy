<?php

declare(strict_types=1);

/*
 * Hivelvet open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * Hivelvet is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with Hivelvet; if not, see <http://www.gnu.org/licenses/>.
 */

namespace Models;

use Models\Base as BaseModel;

/**
 * Class Setting.
 *
 * @property int       $id
 * @property string    $company_name
 * @property string    $company_website
 * @property string    $platform_name
 * @property string    $terms_use
 * @property string    $privacy_policy
 * @property string    $logo
 * @property string    $primary_color
 * @property string    $secondary_color
 * @property string    $accent_color
 * @property string    $additional_color
 * @property \DateTime $created_on
 * @property \DateTime $updated_on
 */
class Setting extends BaseModel
{
    protected $table = 'settings';

    public function saveSettings(string $name, string $website, string $plaform, string $terms, string $policy, ?array $colors): void
    {
        $this->company_name    = $name;
        $this->company_website = $website;
        $this->platform_name   = $plaform;
        $this->terms_use       = $terms;
        $this->privacy_policy  = $policy;
        if ($colors) {
            $this->primary_color    = $colors['primary_color'];
            $this->secondary_color  = $colors['secondary_color'];
            $this->accent_color     = $colors['accent_color'];
            $this->additional_color = $colors['add_color'];
        }
    }

    public function getAllSettings(): array
    {
        $result = [];

        /** @var Setting $defaultSettings */
        $defaultSettings = $this->find([], ['limit' => 1])->current();

        if ($defaultSettings->valid()) {
            $result = [
                'company_name'    => $defaultSettings->company_name,
                'company_website' => $defaultSettings->company_website,
                'platform_name'   => $defaultSettings->platform_name,

                'terms_use'      => $defaultSettings->terms_use,
                'privacy_policy' => $defaultSettings->privacy_policy,
                'logo'           => $defaultSettings->logo,

                'primary_color'    => $defaultSettings->primary_color,
                'secondary_color'  => $defaultSettings->secondary_color,
                'accent_color'     => $defaultSettings->accent_color,
                'additional_color' => $defaultSettings->additional_color,
            ];
        }

        return $result;
    }
}
