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

const API_URL: string = process.env.REACT_APP_API_URL;

export const apiRoutes = {
    REGISTER_URL: API_URL + '/account/register',
    LOGIN_URL: API_URL + '/account/login',
    LOGOUT_URL: API_URL + '/account/logout',
    RESET_PASSWORD_URL: API_URL + '/account/reset-password',
    CHANGE_PASSWORD_URL: API_URL + '/account/change-password',
    RESET_TOKEN_URL: API_URL + '/account/reset-token/',

    LOGS_URL: API_URL + '/logs',

    COLLECT_PRESETS_URL: API_URL + '/collect-presets',
    COLLECT_MY_PRESETS_URL: API_URL + '/collect-my-presets',
    COLLECT_SETTINGS_URL: API_URL + '/collect-settings',
    INSTALL_URL: API_URL + '/install',

    ADD_PRESET_URL: API_URL + '/add-presets',
    EDIT_PRESETS_URL: API_URL + '/presets/',
    EDIT_PRESETS_SUBCATEGORIES_URL: API_URL + '/presets_subcategories/',
    DELETE_PRESET_URL: API_URL + '/presets/',
    LIST_ROLE_URL: API_URL + '/roles',
    ADD_ROLE_URL: API_URL + '/roles',
    EDIT_ROLE_URL: API_URL + '/roles/',
    DELETE_ROLE_URL: API_URL + '/roles/',
    COLLECT_ROLES_URL: API_URL + '/roles/collect',

    LIST_USER_URL: API_URL + '/users',
    ADD_USER_URL: API_URL + '/users',
    EDIT_USER_URL: API_URL + '/users/',
    DELETE_USER_URL: API_URL + '/users/',

    COLLECT_PRIVILEGES_URL: API_URL + '/roles_permissions/collect',
};
