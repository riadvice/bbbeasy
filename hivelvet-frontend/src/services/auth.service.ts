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

class AuthService {
    register(data: object) {
        return axios.post(apiRoutes.REGISTER_URL, {
            data,
        });
    }
    login(email: string, password: string) {
        return axios.post(apiRoutes.LOGIN_URL, {
            email,
            password,
        });
    }
    logout() {
        return axios.get(apiRoutes.LOGOUT_URL);
    }

    reset_password(email: string) {
        return axios.post(apiRoutes.RESET_PASSWORD_URL, {
            email,
        });
    }
    change_password(token: string, password: string) {
        return axios.post(apiRoutes.CHANGE_PASSWORD_URL, {
            token,
            password,
        });
    }
    getResetPasswordByToken(token: string) {
        return axios.get(apiRoutes.RESET_TOKEN_URL + token, {});
    }
    getCurrentUser() {
        const userStr: string = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
    getCurrentSession() {
        const sessionStr: string = localStorage.getItem('session');
        if (sessionStr) return JSON.parse(sessionStr);
        return null;
    }
}

export default new AuthService();
