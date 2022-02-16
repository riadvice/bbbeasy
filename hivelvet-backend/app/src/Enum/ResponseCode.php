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

namespace Enum;

class ResponseCode extends Enum
{
    final public const HTTP_OK                    = 200;
    final public const HTTP_NO_CONTENT            = 204;
    final public const HTTP_BAD_REQUEST           = 400;
    final public const HTTP_UNAUTHORIZED          = 401;
    final public const HTTP_FORBIDDEN             = 403;
    final public const HTTP_NOT_FOUND             = 404;
    final public const HTTP_UNPROCESSABLE_ENTITY  = 422;                                        // RFC4918
    final public const HTTP_INTERNAL_SERVER_ERROR = 500;
}
