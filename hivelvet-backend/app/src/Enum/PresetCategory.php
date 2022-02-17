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

class PresetCategory extends Enum
{
    final public const GENERAL                      = 'general';
    final public const SECURITY                     = 'security';
    final public const RECORDING                    = 'recording';
    final public const BREAKOUT_ROOMS               = 'breakout_rooms';
    final public const WEBCAMS                      = 'WEBCAMS';
    final public const SCREENSHARE                  = 'screenshare';
    final public const BRANDING                     = 'branding';
    final public const AUDIO                        = 'audio';
    final public const LANGUAGE                     = 'language';
    final public const WHITEBOARD                   = 'whiteboard';
    final public const LOCK_SETTINGS                = 'lock_settings';
    final public const LAYOUT                       = 'layout';
    final public const GUEST_POLICY                 = 'guest_policy';
    final public const LEARNING_ANALYTICS_DASHBOARD = 'learning_analytics_dashboard';
    final public const USER_EXPERIENCE              = 'user_experience';
    final public const ZCALERIGHT_LOAD_BALANCER     = 'zcaleright_load_balancer';
}
