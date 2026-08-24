/**
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
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

import axios, { AxiosRequestHeaders } from 'axios';
import AuthService from '../services/auth.service';

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
    try {
        const session = AuthService.getCurrentSession();
        if (session?.accessToken) {
            config.headers = (config.headers || {}) as AxiosRequestHeaders;
            Object.assign(config.headers, {
                Authorization: `${session.tokenType ?? 'Bearer'} ${session.accessToken}`,
            });
        }
    } catch (error) {
        console.warn('Failed to process auth state from localStorage:', error);
        AuthService.clearAuth();
    }

    return config;
});

// Handle 401 responses globally: clear auth state and redirect to login
let isRedirectingToLogin = false;
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401 && !isRedirectingToLogin) {
            const currentPath = window.location.pathname;
            // Don't redirect if already on login page
            if (currentPath !== '/login' && currentPath !== '/') {
                isRedirectingToLogin = true;
                AuthService.clearAuth();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);
