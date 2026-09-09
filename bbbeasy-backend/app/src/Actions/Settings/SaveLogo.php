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

namespace Actions\Settings;

use Actions\Base as BaseAction;
use Enum\ResponseCode;
use Models\User;

/**
 * Stores the branding logo.
 */
class SaveLogo extends BaseAction
{
    private const ALLOWED_MIMES = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
    ];

    /**
     * @param mixed $f3
     * @param mixed $params
     *
     * @throws \JsonException
     */
    public function execute($f3, $params): void
    {
        $errorMessage = 'File could not be saved';

        // The installer runs before any account exists, afterwards only somebody
        // allowed to edit the settings may replace the logo.
        if (!$this->canEditSettings()) {
            $this->logger->warning($errorMessage, ['error' => 'not allowed to edit the settings']);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);

            return;
        }

        $file = $f3->get('FILES.logo');
        if (null === $file || !isset($file['tmp_name']) || '' === $file['tmp_name']) {
            $this->logger->error($errorMessage, ['error' => 'no file uploaded']);
            $this->renderJson(['message' => 'no file uploaded'], ResponseCode::HTTP_BAD_REQUEST);

            return;
        }

        if (UPLOAD_ERR_OK !== $file['error']) {
            $this->logger->error($errorMessage, ['error' => 'upload.invalid_parameters']);
            $this->renderJson(['message' => 'upload.invalid_parameters'], ResponseCode::HTTP_PRECONDITION_FAILED);

            return;
        }

        // Read the format from the file itself, the type sent with the request is
        // whatever the client chose to put in the multipart header.
        $mimeType  = new \finfo(FILEINFO_MIME_TYPE)->file($file['tmp_name']);
        $extension = array_search($mimeType, self::ALLOWED_MIMES, true);
        if (false === $extension) {
            $this->logger->error($errorMessage, ['error' => 'invalid file format : ' . $mimeType]);
            $this->renderJson(['message' => 'invalid file format'], ResponseCode::HTTP_PRECONDITION_FAILED);

            return;
        }

        if (filesize($file['tmp_name']) > $this->maxUploadSize()) {
            $this->logger->error($errorMessage, ['error' => 'upload.exceeded_file_size']);
            $this->renderJson(['message' => 'upload.exceeded_file_size'], ResponseCode::HTTP_PRECONDITION_FAILED);

            return;
        }

        // The name is generated here, an uploader does not get to choose where the
        // file lands or what it is called.
        $uploadDir = realpath($this->f3->get('UPLOADS'));
        $name      = 'logo-' . $this->f3->hash($file['tmp_name'] . microtime()) . '.' . $extension;
        if (false === $uploadDir || !move_uploaded_file($file['tmp_name'], mb_rtrim($uploadDir, '/\\') . '/' . $name)) {
            $this->logger->error($errorMessage, ['error' => 'upload.failed_to_move']);
            $this->renderJson(['message' => 'upload.failed_to_move'], ResponseCode::HTTP_PRECONDITION_FAILED);

            return;
        }

        $this->logger->info('Logo successfully saved', ['logo' => $name]);
        $this->renderJson(['result' => 'success', 'logo' => $name]);
    }

    private function canEditSettings(): bool
    {
        if (!new User()->adminUserExists()) {
            return true;
        }

        $permissions = $this->session->get('user.permissions');

        return \is_array($permissions)
            && isset($permissions['settings'])
            && \in_array('edit', (array) $permissions['settings'], true);
    }

    private function maxUploadSize(): int
    {
        $value    = (int) $this->f3->get('UPLOAD.maxsize.image.value');
        $exponent = mb_strtoupper((string) $this->f3->get('UPLOAD.maxsize.image.exponent'));
        $factor   = 'KB' === $exponent ? 1024 : ('GB' === $exponent ? 1024 ** 3 : 1024 ** 2);

        return $value > 0 ? $value * $factor : 1024 ** 2;
    }
}
