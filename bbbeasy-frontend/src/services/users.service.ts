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

class UsersService {
    collect_users(data: object) {
        return axiosInstance.post(apiRoutes.COLLECT_USERS_URL, {
            data,
        });
    }

    list_users() {
        return axiosInstance.get(apiRoutes.LIST_USER_URL);
    }

    add_user(data: object) {
        return axiosInstance.post(apiRoutes.ADD_USER_URL, {
            data,
        });
    }

    edit_user(data: object, id: number) {
        return axiosInstance.put(apiRoutes.EDIT_USER_URL + id, {
            data,
        });
    }

    delete_user(id: number) {
        return axiosInstance.delete(apiRoutes.DELETE_USER_URL + id);
    }
}

export default new UsersService();
