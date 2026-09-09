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

import { axiosInstance } from '../lib/AxiosInstance';
import { apiRoutes } from '../routing/backend-config';
import { SettingsType } from '../types/SettingsType';

/**
 * Fired after the branding settings are saved, so the parts of the layout that
 * read them once on mount (the sider and the header logo) can catch up without
 * a page reload.
 */
export const SETTINGS_UPDATED = 'bbbeasy:settings-updated';

class SettingsService {
    collect_settings() {
        return axiosInstance.get(apiRoutes.COLLECT_SETTINGS_URL);
    }

    edit_settings(data: object) {
        return axiosInstance.put(apiRoutes.EDIT_SETTINGS_URL, {
            data,
        });
    }

    announce_settings(settings: SettingsType) {
        window.dispatchEvent(new CustomEvent<SettingsType>(SETTINGS_UPDATED, { detail: settings }));
    }

    on_settings_updated(listener: (settings: SettingsType) => void) {
        const handler = (event: Event) => listener((event as CustomEvent<SettingsType>).detail);
        window.addEventListener(SETTINGS_UPDATED, handler);

        return () => window.removeEventListener(SETTINGS_UPDATED, handler);
    }
}

export default new SettingsService();
