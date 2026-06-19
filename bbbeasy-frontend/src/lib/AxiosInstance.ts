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

import axios from 'axios';

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
    try {
        const sessionStr = localStorage.getItem('session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            if (session?.expiresAt && Date.parse(session.expiresAt) < Date.now()) {
                localStorage.removeItem('user');
                localStorage.removeItem('session');
                return config;
            }

            if (session?.accessToken && session?.tokenType) {
                config.headers = config.headers || {};
                Object.assign(config.headers, {
                    Authorization: `${session.tokenType} ${session.accessToken}`,
                });
            }
        }
    } catch (error) {
        localStorage.removeItem('session');
    }

    return config;
});
