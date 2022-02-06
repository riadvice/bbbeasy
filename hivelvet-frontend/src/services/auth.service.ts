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

class AuthService {
    install(data: object) {
        return axios.post(API_URL + '/install', {
            data,
        });
    }

    register(username: string, email: string, password: string, confirmPassword: string) {
        return axios.post(API_URL + '/account/register', {
            username,
            email,
            password,
            confirmPassword,
        });
    }
    login(email: string, password: string) {
        return axios.post(API_URL + '/account/login', {
            email,
            password,
        });
    }
    logout() {
        localStorage.removeItem('user');
    }

    reset_password(email: string) {
        return axios.post(API_URL + '/account/reset', {
            email,
        });
    }
    change_password(token: string, password: string) {
        return axios.post(API_URL + '/account/change-password', {
            token,
            password,
        });
    }
    getUser(token: string) {
        return axios.get(API_URL + '/account/get-user?token=' + token, {});
    }
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
}

export default new AuthService();
