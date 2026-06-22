<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
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

namespace Models;

use Models\Base as BaseModel;
use Respect\Validation\Validator;
use Validation\DataChecker;

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

    public function saveSettings(string $name, string $website, string $plaform, ?string $terms, ?string $policy, ?string $logo, ?array $theme, bool $self_registration, bool $send_registration): void
    {
        $this->company_name      = $name;
        $this->company_website   = $website;
        $this->platform_name     = $plaform;
        $this->terms_use         = $terms;
        $this->privacy_policy    = $policy;
        $this->logo              = $logo;
        $this->self_registration = $self_registration;
        $this->send_registration = $send_registration;

        if ($theme) {
            $this->brand_color       = $theme['brand_color'];
            $this->default_font_size = $theme['default_font_size'];
            $this->border_radius     = $theme['border_radius'];
            $this->wireframe_style   = $theme['wireframe_style'];
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

                'brand_color'       => $defaultSettings->brand_color,
                'default_font_size' => $defaultSettings->default_font_size,
                'border_radius'     => $defaultSettings->border_radius,
                'wireframe_style'   => $defaultSettings->wireframe_style,
                'self_registration' => $defaultSettings->self_registration,
                'send_registration' => $defaultSettings->send_registration,
            ];
        }

        return $result;
    }

    public function checkSettingsData(DataChecker $dataChecker, array $form): DataChecker
    {
        $dataChecker->verify($form['company_name'], Validator::notEmpty()->setName('company_name'));
        $dataChecker->verify($form['company_url'], Validator::url()->setName('company_url'));
        $dataChecker->verify($form['platform_name'], Validator::notEmpty()->setName('platform_name'));

        if (null !== $form['term_url']) {
            $dataChecker->verify($form['term_url'], Validator::url()->setName('term_url'));
        }
        if (null !== $form['policy_url']) {
            $dataChecker->verify($form['policy_url'], Validator::url()->setName('policy_url'));
        }

        $dataChecker->verify($form['theme'], Validator::notEmpty()->setName('color'));
        $dataChecker->verify($form['theme']['brand_color'], Validator::notEmpty()->setName('brand_color'));
        $dataChecker->verify($form['theme']['default_font_size'], Validator::notEmpty()->setName('default_font_size'));
        $dataChecker->verify($form['theme']['border_radius'], Validator::notEmpty()->setName('border_radius'));

        return $dataChecker;
    }
}
