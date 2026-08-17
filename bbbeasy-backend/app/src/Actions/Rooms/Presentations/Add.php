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

namespace Actions\Rooms\Presentations;

use Actions\Base as BaseAction;
use Actions\RequirePrivilegeTrait;
use Enum\ResponseCode;
use Models\Room;

class Add extends BaseAction
{
    use RequirePrivilegeTrait;
    use RoomPresentationsTrait;

    public const MAX_PRESENTATIONS = 8;

    /**
     * @param \Base $f3
     * @param array $params
     */
    public function save($f3, $params): void
    {
        $room = new Room();
        $room = $room->getById($params['id']);

        if (!$room->valid() || !$this->canManageRoom($room)) {
            $this->logger->warning('Access denied to room presentations upload', ['room_id' => $params['id']]);
            $this->renderJson([], ResponseCode::HTTP_NOT_FOUND);

            return;
        }

        $presentations = $room->getPresentations();
        if (\count($presentations) >= self::MAX_PRESENTATIONS) {
            $this->logger->warning('Maximum number of room presentations reached', ['room_id' => $room->id]);
            $this->renderJson(['errors' => ['presentation' => 'Maximum number of presentations reached']], ResponseCode::HTTP_PRECONDITION_FAILED);

            return;
        }

        $file = $this->f3->get('FILES.presentation');
        if (null === $file || !isset($file['tmp_name']) || '' === $file['tmp_name']) {
            $this->logger->error('Presentation file is missing', ['room_id' => $room->id]);
            $this->renderJson(['errors' => ['presentation' => 'Presentation file is required']], ResponseCode::HTTP_UNPROCESSABLE_ENTITY);

            return;
        }
        if (UPLOAD_ERR_OK !== $file['error']) {
            $uploadError = UPLOAD_ERR_INI_SIZE === $file['error'] || UPLOAD_ERR_FORM_SIZE === $file['error']
                ? 'upload.exceeded_file_size'
                : 'upload.invalid_parameters';
            $this->logger->error('Presentation could not be saved', ['room_id' => $room->id, 'error' => $uploadError]);
            $this->renderJson(['errors' => ['presentation' => $uploadError]], ResponseCode::HTTP_PRECONDITION_FAILED);

            return;
        }

        // validate the real mime type of the uploaded file (jpg/png/pdf per app configuration)
        $fileInfo  = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType  = $fileInfo->file($file['tmp_name']);
        $extension = array_search($mimeType, $this->f3->get('UPLOAD.allowed.mimes.images'), true);
        if (false === $extension) {
            $this->logger->error('Presentation could not be saved', ['room_id' => $room->id, 'error' => 'invalid file format : ' . $mimeType]);
            $this->renderJson(['errors' => ['presentation' => 'upload.invalid_format']], ResponseCode::HTTP_PRECONDITION_FAILED);

            return;
        }

        // enforce the configured max upload size
        if (filesize($file['tmp_name']) > $this->maxUploadSize()) {
            $this->logger->error('Presentation could not be saved', ['room_id' => $room->id, 'error' => 'upload.exceeded_file_size']);
            $this->renderJson(['errors' => ['presentation' => 'upload.exceeded_file_size']], ResponseCode::HTTP_PRECONDITION_FAILED);

            return;
        }

        $uploadDir = realpath($this->f3->get('UPLOADS'));
        $name      = 'presentation-' . $this->f3->hash($file['tmp_name'] . microtime()) . '.' . $extension;
        if (false === $uploadDir || !move_uploaded_file($file['tmp_name'], rtrim($uploadDir, '/\\') . '/' . $name)) {
            $this->logger->error('Presentation could not be saved', ['room_id' => $room->id, 'error' => 'upload.failed_to_move']);
            $this->renderJson(['errors' => ['presentation' => 'upload.failed_to_move']], ResponseCode::HTTP_PRECONDITION_FAILED);

            return;
        }

        $presentations[] = $name;
        $room->setPresentations($presentations);
        $room->save();

        $this->logger->info('Presentation successfully saved for room', ['room_id' => $room->id, 'name' => $name]);
        $this->renderJson([
            'result'       => 'success',
            'presentation' => [
                'name' => $name,
                'url'  => $this->presentationUrl($name),
            ],
        ]);
    }

    private function maxUploadSize(): int
    {
        $value    = (int) $this->f3->get('UPLOAD.maxsize.image.value');
        $exponent = $this->f3->get('UPLOAD.maxsize.image.exponent');

        return match ($exponent) {
            'KB'    => $value * 1024,
            'MB'    => $value * 1024 * 1024,
            default => $value,
        };
    }
}
