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

namespace Actions\Settings;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Setting;
use Respect\Validation\Validator;
use Validation\DataChecker;

/**
 * Class Edit.
 */
class Edit extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param $f3
     * @param $params
     *
     * @throws \JsonException
     */
    public function save($f3, $params): void
    {
        $body = $this->getDecodedBody();
        $form = $body['data'];

        $setting = new Setting();

        /** @var Setting $settings */
        $settings = $setting->find([], ['limit' => 1])->current();

        $errorMessage = 'Settings could not be updated';

        if ($settings->valid()) {
            $dataChecker = new DataChecker();
            $dataChecker->verify($form['company_name'], Validator::notEmpty()->setName('company_name'));
            $dataChecker->verify($form['company_url'], Validator::url()->setName('company_url'));
            $dataChecker->verify($form['platform_name'], Validator::notEmpty()->setName('platform_name'));

            if ('' !== $form['term_url']) {
                $dataChecker->verify($form['term_url'], Validator::url()->setName('term_url'));
            }
            if ('' !== $form['policy_url']) {
                $dataChecker->verify($form['policy_url'], Validator::url()->setName('policy_url'));
            }
            $dataChecker->verify($form['branding_colors'], Validator::notEmpty()->setName('color'));
            $dataChecker->verify($form['branding_colors']['primary_color'], Validator::hexRgbColor()->setName('primary_color'));
            $dataChecker->verify($form['branding_colors']['secondary_color'], Validator::hexRgbColor()->setName('secondary_color'));
            $dataChecker->verify($form['branding_colors']['accent_color'], Validator::hexRgbColor()->setName('accent_color'));
            $dataChecker->verify($form['branding_colors']['add_color'], Validator::hexRgbColor()->setName('additional_color'));

            if ($dataChecker->allValid()) {
                $settings->saveSettings(
                    $form['company_name'],
                    $form['company_url'],
                    $form['platform_name'],
                    $form['term_url'],
                    $form['policy_url'],
                    $form['branding_colors'],
                );
            } else {
                $this->logger->error($errorMessage, ['errors' => $dataChecker->getErrors()]);

                $this->renderJson(['errors' => $dataChecker->getErrors()], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);

                return;
            }

            try {
                $settings->save();
            } catch (\Exception $e) {
                $this->logger->error($errorMessage, ['error' => $e->getMessage()]);
                $this->renderJson(['errors' => $e->getMessage()], ResponseCode::HTTP_INTERNAL_SERVER_ERROR);

                return;
            }

            $this->logger->info('Settings successfully updated', ['settings' => $settings->toArray()]);
            $this->renderJson(['result' => 'success', 'settings' => $settings->getAllSettings()]);
        }
    }
}
