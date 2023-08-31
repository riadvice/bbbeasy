/**
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
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import { notification } from 'antd';
import { t } from 'i18next';
import LocaleService from '../services/locale.service';

class Notifications {
    openNotificationWithIcon = (type: string, message, icon?: React.ReactNode, duration?: number) => {
        notification[type]({
            placement: LocaleService.direction == 'rtl' ? 'topLeft' : 'topRight',
            message: t(type + '-title'),
            description: (
                <>
                    {message}
                    <div className="progress-bar">
                        <span className={duration ? 'percentage notif-login' : 'percentage'} />
                    </div>
                </>
            ),
            icon: icon,
            duration: duration,
        });
    };
}

export default new Notifications();
