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

namespace Actions\Core;

use Actions\Base as BaseAction;

/**
 * Class LocalesController.
 */
class GetFile extends BaseAction
{
    /**
     * @param \Base $f3
     * @param array $params
     */
    public function execute($f3, $params)
    {
        $file = $f3->get('PARAMS.filename');

        // PDFs must be rendered inline so the room presentation preview (iframe)
        // can display them; everything else keeps the download disposition.
        $inline = 'pdf' === mb_strtolower(pathinfo($file, PATHINFO_EXTENSION));

        // Resolve the uploads directory to an absolute path to avoid CWD issues
        $uploadsDir = realpath($f3->get('BASE') . DIRECTORY_SEPARATOR . $f3->get('UPLOADS'));
        if (!$uploadsDir) {
            // Fallback: resolve relative to this file's location
            $uploadsDir = realpath(__DIR__ . '/../../../../uploads');
        }
        $filePath = $uploadsDir . DIRECTORY_SEPARATOR . $file;

        if (!file_exists($filePath)) {
            $f3->error(404);
            return;
        }

        return \Web::instance()->send($filePath, null, 0, !$inline);
    }
}
