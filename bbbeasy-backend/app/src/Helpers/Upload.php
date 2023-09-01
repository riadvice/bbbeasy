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

namespace Helpers;

use Log\LogWriterTrait;
use Utils\Environment;
use Validation\DataChecker;

/**
 * Class Upload.
 */
class Upload extends \Prefab
{
    use LogWriterTrait;

    /**
     * f3 instance.
     *
     * @var \Base f3
     */
    protected $f3;

    /**
     * Validator.
     *
     * @var DataChecker
     */
    protected $v;

    protected $uploads;

    /**
     * initialize helper.
     */
    public function __construct()
    {
        $this->f3      = \Base::instance();
        $this->v       = new DataChecker();
        $this->uploads = [];
        $this->initLogger();
    }

    public function uploadImage($file, $uploadSubDir, $formFieldName)
    {
        return $this->upload($file, $this->f3->get('UPLOADS') . $uploadSubDir, $this->getMaxSize(), $this->f3->get('UPLOAD.allowed.mimes.images'), $formFieldName);
    }

    public function uploadImageBase64($fileData, $uploadSubDir, $formFieldName)
    {
        $f        = finfo_open();
        $data     = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $fileData), true);
        $mimeType = finfo_buffer($f, $data, FILEINFO_MIME_TYPE);

        // check mime-type
        if (false === $ext = array_search($mimeType, $this->f3->get('UPLOAD.allowed.mimes.images'), true)) {
            return ['error' => 'upload.invalid_format'];
        }

        // check file size
        if (mb_strlen($data) > $this->getMaxSize()) {
            return ['error' => 'upload.exceeded_file_size'];
        }
        $name = $formFieldName . $this->f3->hash(microtime()) . '.' . $ext;

        $this->prepareUploadDirectory($uploadDirectory = $this->f3->get('UPLOADS') . $uploadSubDir);

        if (false === file_put_contents($this->f3->get('UPLOADS') . $uploadSubDir . $name, $data)) {
            return ['error' => 'upload.failed_to_move'];
        }
        $this->uploads[$formFieldName] = $uploadSubDir . $name;

        return [
            'error' => null,
        ];
    }

    public function uploadChatFile($file, $uploadSubDir, $formFieldName)
    {
        return $this->upload($file, $this->f3->get('UPLOADS') . $uploadSubDir, null, null, $formFieldName, true);
    }

    /**
     * @return array
     */
    public function uploadedFiles()
    {
        return $this->uploads;
    }

    /**
     * @param array  $file
     * @param string $uploadDirectory
     * @param int    $maxSize
     * @param array  $allowedFiles
     * @param string $formFieldName
     * @param bool   $useGeneratedName
     *
     * @return array
     */
    protected function upload($file, $uploadDirectory, $maxSize, $allowedFiles, $formFieldName, $useGeneratedName = false)
    {
        // Undefined | Multiple Files | $_FILES Corruption Attack
        // If this request falls under any of them, treat it invalid.
        if (!isset($file['error']) || \is_array($file['error'])) {
            return ['error' => 'upload.invalid_parameters'];
        }

        // Check $file['error'] value.
        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;

            case UPLOAD_ERR_NO_FILE:
                return ['error' => 'upload.no_file'];

            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return ['error' => 'upload.exceeded_file_size'];

            default:
                return ['error' => 'upload.unknown'];
        }

        // You should also check filesize here.
        if (null !== $maxSize && !$this->v->size(null, $maxSize)->validate($file['tmp_name'])) {
            return ['error' => 'upload.exceeded_file_size'];
        }

        // Check MIME Type by yourself because $file['mime'] must not be trusted.
        $fileInfo = new \finfo(FILEINFO_MIME_TYPE);
        if (null !== $allowedFiles && false === $ext = array_search($fileInfo->file($file['tmp_name']), $allowedFiles, true)) {
            return ['error' => 'upload.invalid_format'];
        }

        $this->prepareUploadDirectory($uploadDirectory);

        if ($useGeneratedName) {
            $fileName = $formFieldName;
        } else {
            $fileName = $formFieldName . $this->f3->hash($file['tmp_name']) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
        }

        $destination = "{$uploadDirectory}/{$fileName}";
        if (!$this->saveUploadedFile($file, $destination)) {
            return ['error' => 'upload.failed_to_move'];
        }

        $this->uploads[$formFieldName] = str_replace($this->f3->get('UPLOADS'), '', $uploadDirectory . $fileName);

        return [
            'error' => null,
        ];
    }

    protected function getMaxSize()
    {
        $maxSizeValue = $this->f3->get('UPLOAD.maxsize.image.value');
        $maxSizeExp   = $this->f3->get('UPLOAD.maxsize.image.exponent');

        return match ($maxSizeExp) {
            'KB'    => $maxSizeValue * 1024,
            'MB'    => $maxSizeValue * 1024 * 1024,
            default => $maxSizeValue,
        };
    }

    protected function saveUploadedFile($file, $destination)
    {
        if (Environment::isTest()) {
            return rename($file['tmp_name'], $destination);
        }

        return move_uploaded_file($file['tmp_name'], $destination);
    }

    protected function prepareUploadDirectory($uploadDirectory): void
    {
        if (!is_dir($uploadDirectory)) {
            // @fixme
            mkdir($uploadDirectory, 0o755, true);
        }
    }
}
