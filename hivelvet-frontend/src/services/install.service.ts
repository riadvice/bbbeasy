/**
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

import axios from 'axios';
import { apiRoutes } from '../routing/backend-config';

class InstallService {
    collect_presets() {
        return axios.get(apiRoutes.COLLECT_PRESETS_URL);
    }
    collect_settings() {
        return axios.get(apiRoutes.COLLECT_SETTINGS_URL);
    }
    install(data: object) {
        return axios.post(apiRoutes.INSTALL_URL, {
            data,
        });
    }
    collect_admin(data: object) {
        return axios.post(apiRoutes.COLLECT_ADMIN_URL, {
            data,
        });
    }
}

export default new InstallService();
