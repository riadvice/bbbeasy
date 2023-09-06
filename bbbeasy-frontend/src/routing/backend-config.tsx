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

const API_URL: string = window.location.origin + process.env.REACT_APP_API_ROUTE;

export const apiRoutes = {
    REGISTER_URL: API_URL + '/account/register',
    LOGIN_URL: API_URL + '/account/login',
    LOGOUT_URL: API_URL + '/account/logout',
    RESET_PASSWORD_URL: API_URL + '/account/reset-password',
    CHANGE_PASSWORD_URL: API_URL + '/account/change-password',
    RESET_TOKEN_URL: API_URL + '/account/reset-token/',
    EDIT_ACCOUNT_URL: API_URL + '/account/edit',

    LOGS_URL: API_URL + '/logs',

    NOTIFICATION_URL: API_URL + '/notification',

    COLLECT_USERS_URL: API_URL + '/users/collect',
    COLLECT_PRESET_SETTINGS_URL: API_URL + '/preset-settings',
    EDIT_PRESET_SETTINGS_URL: API_URL + '/preset-settings',
    COLLECT_SETTINGS_URL: API_URL + '/settings',
    EDIT_SETTINGS_URL: API_URL + '/settings',
    SAVE_FILE_URL: API_URL + '/settings',
    INSTALL_URL: API_URL + '/install',

    LIST_ROLE_URL: API_URL + '/roles',
    ADD_ROLE_URL: API_URL + '/roles',
    EDIT_ROLE_URL: API_URL + '/roles/',
    DELETE_ROLE_URL: API_URL + '/roles/',
    COLLECT_ROLES_URL: API_URL + '/roles/collect',

    COLLECT_PRIVILEGES_URL: API_URL + '/roles-permissions',

    LIST_USER_URL: API_URL + '/users',
    ADD_USER_URL: API_URL + '/users',
    EDIT_USER_URL: API_URL + '/users/',
    DELETE_USER_URL: API_URL + '/users/',

    LIST_LABEL_URL: API_URL + '/labels',
    ADD_LABEL_URL: API_URL + '/labels',
    EDIT_LABEL_URL: API_URL + '/labels/',
    DELETE_LABEL_URL: API_URL + '/labels/',

    LIST_PRESETS_URL: API_URL + '/presets/',
    ADD_PRESET_URL: API_URL + '/presets',
    EDIT_PRESETS_URL: API_URL + '/presets/',
    EDIT_PRESETS_SUBCATEGORIES_URL: API_URL + '/presets/subcategories/',
    COPY_PRESET_URL: API_URL + '/presets/copy/',
    DELETE_PRESET_URL: API_URL + '/presets/',

    LIST_ROOMS_URL: API_URL + '/rooms/',
    ADD_ROOM_URL: API_URL + '/rooms',
    EDIT_ROOM_URL: API_URL + '/rooms/',
    DELETE_ROOM_URL: API_URL + '/rooms/',
    START_ROOM_URL: API_URL + '/rooms/',
    GET_ROOM_BY_LINK: API_URL + '/rooms/get/',

    COLLECT_RECORDINGS_URL: API_URL + '/recordings',
    LIST_RECORDINGS_URL: API_URL + '/recordings/',
    EDIT_RECORDING_URL: API_URL + '/recordings/',
    PUBLISH_RECORDING_URL: API_URL + '/recordings/publish/',
    DELETE_RECORDING_URL: API_URL + '/recordings/',
};
