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
import { UserType } from '../types/UserType';
import { SessionType } from '../types/SessionType';

class AuthService {
    register(data: object) {
        return axiosInstance.post(apiRoutes.REGISTER_URL, {
            data,
        });
    }

    login(email: string, password: string) {
        return axiosInstance.post(apiRoutes.LOGIN_URL, {
            email,
            password,
        });
    }

    logout() {
        return axiosInstance.get(apiRoutes.LOGOUT_URL);
    }

    reset_password(email: string) {
        return axiosInstance.post(apiRoutes.RESET_PASSWORD_URL, {
            email,
        });
    }

    change_password(token: string, password: string) {
        return axiosInstance.post(apiRoutes.CHANGE_PASSWORD_URL, {
            token,
            password,
        });
    }

    get_reset_password(token: string) {
        return axiosInstance.get(apiRoutes.RESET_TOKEN_URL + token);
    }

    edit_account(data: object) {
        return axiosInstance.put(apiRoutes.EDIT_ACCOUNT_URL, { data });
    }

    addCurrentUser(user: UserType) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    addCurrentSession(session: SessionType) {
        localStorage.setItem('session', JSON.stringify(session));
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

    updateCurrentUser(username: string, email: string, avatar: string) {
        const userStr: string = localStorage.getItem('user');
        if (userStr) {
            const userObj: UserType = JSON.parse(userStr);
            userObj.username = username;
            userObj.email = email;
            userObj.avatar = avatar;

            this.addCurrentUser(userObj);
        }
    }

    getActionsPermissionsByGroup(group: string): string[] {
        const currentUser: UserType = this.getCurrentUser();
        if (currentUser) return currentUser.permissions[group];
        return [];
    }

    isAllowedGroup = (groups: string[], group: string): boolean => {
        return groups.includes(group);
    };

    isAllowedAction = (actions: string[], action: string): boolean => {
        return actions.includes(action);
    };
}

export default new AuthService();
