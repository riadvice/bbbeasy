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

namespace Actions\Settings;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Setting;
use Utils\DataUtils;
use Validation\DataChecker;

/**
 * Class Edit.
 */
class Edit extends BaseAction
{
    use RequirePrivilegeTrait;

    /**
     * @param mixed $f3
     * @param mixed $params
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
            $dataChecker = $setting->checkSettingsData($dataChecker, $form);

            if ($dataChecker->allValid()) {
                if (null !== $form['logo']) {
                    $logoName = $form['logo'];
                    if (!DataUtils::validateImageFormat($logoName)) {
                        $this->logger->error($errorMessage, ['errors' => 'invalid file format']);

                        $this->renderJson(['message' => 'invalid file format'], ResponseCode::HTTP_PRECONDITION_FAILED);

                        return;
                    }
                }
                $settings->saveSettings(
                    $form['company_name'],
                    $form['company_url'],
                    $form['platform_name'],
                    $form['term_url'],
                    $form['policy_url'],
                    $form['logo'],
                    $form['theme'],
                    $form['self_registration'],
                    $form['send_registration']
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
