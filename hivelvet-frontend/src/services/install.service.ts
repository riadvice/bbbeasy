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

const API_URL = process.env.REACT_APP_API_URL;

class InstallService {
    collect_presets() {
        return axios.get(API_URL + '/collect-presets');
    }
    collect_settings() {
        return axios.get(API_URL + '/collect-settings');
    }
    install(data: object) {
        return axios.post(API_URL + '/install', {
            data,
        });
    }
}

export default new InstallService();
