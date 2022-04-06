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

class RolesService {
    list_users() {
        return axios.get(apiRoutes.LIST_USER_URL);
    }

    list_roles() {
        return axios.get(apiRoutes.COLLECT_ROLES_URL);
    }

    add_user(data: object) {
        return axios.post(apiRoutes.ADD_USER_URL, {
            data,
        });
    }

    edit_user(data: object, id: number) {
        return axios.put(apiRoutes.EDIT_USER_URL + id, {
            data,
        });
    }

    delete_user(id: number) {
        return axios.delete(apiRoutes.DELETE_USER_URL + id);
    }
}

export default new RolesService();
