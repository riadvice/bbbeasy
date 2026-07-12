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

type AuthState = {
    user?: UserType;
    session?: SessionType;
};

class AuthService {
    private readonly authStorageKey = 'auth';

    private readStoredAuth(): AuthState {
        const authStr = localStorage.getItem(this.authStorageKey);
        if (authStr) {
            try {
                const authData = JSON.parse(authStr);
                return authData && typeof authData === 'object' ? authData : {};
            } catch {
                localStorage.removeItem(this.authStorageKey);
            }
        }

        return {};
    }

    private migrateLegacyAuth(): AuthState {
        const legacyUserStr = localStorage.getItem('user');
        const legacySessionStr = localStorage.getItem('session');
        if (!legacyUserStr && !legacySessionStr) {
            return {};
        }

        try {
            const authState: AuthState = {
                user: legacyUserStr ? (JSON.parse(legacyUserStr) as UserType) : undefined,
                session: legacySessionStr ? (JSON.parse(legacySessionStr) as SessionType) : undefined,
            };
            localStorage.setItem(this.authStorageKey, JSON.stringify(authState));
            localStorage.removeItem('user');
            localStorage.removeItem('session');

            return authState;
        } catch {
            localStorage.removeItem('user');
            localStorage.removeItem('session');
            return {};
        }
    }

    private readAuth(): AuthState {
        const storedAuth = this.readStoredAuth();
        if (storedAuth.user || storedAuth.session) {
            return storedAuth;
        }

        return this.migrateLegacyAuth();
    }

    private writeAuth(nextAuth: AuthState): void {
        if (!nextAuth.user && !nextAuth.session) {
            localStorage.removeItem(this.authStorageKey);
            return;
        }

        localStorage.setItem(this.authStorageKey, JSON.stringify(nextAuth));
    }

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
        const auth = this.readAuth();
        this.writeAuth({
            user,
            session: auth.session,
        });
    }

    addCurrentSession(session: SessionType) {
        const auth = this.readAuth();
        this.writeAuth({
            user: auth.user,
            session,
        });
    }

    getCurrentUser(): UserType | null {
        const auth = this.readAuth();
        if (auth.user) {
            return auth.user;
        }

        return null;
    }

    getCurrentSession(): SessionType | null {
        const auth = this.readAuth();
        if (auth.session) {
            if (auth.session.expiresAt && Date.parse(auth.session.expiresAt) < Date.now()) {
                this.clearAuth();
                return null;
            }

            return auth.session;
        }

        return null;
    }

    getAccessToken(): string | null {
        const currentSession = this.getCurrentSession();
        return currentSession ? currentSession.accessToken : null;
    }

    clearAuth() {
        localStorage.removeItem(this.authStorageKey);
        localStorage.removeItem('user');
        localStorage.removeItem('session');
    }

    updateCurrentUser(username: string, email: string, avatar: string) {
        const auth = this.readAuth();
        if (auth.user) {
            const userObj: UserType = auth.user;
            userObj.username = username;
            userObj.email = email;
            userObj.avatar = avatar;

            this.addCurrentUser(userObj);
        }
    }

    getActionsPermissionsByGroup(group: string): string[] {
        const currentUser = this.getCurrentUser();
        if (currentUser?.permissions && currentUser.permissions[group]) {
            return currentUser.permissions[group] as string[];
        }
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
