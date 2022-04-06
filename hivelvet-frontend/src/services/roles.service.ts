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
    list_roles() {
        return axios.get(apiRoutes.LIST_ROLE_URL);
    }

    list_permissions() {
        return axios.get(apiRoutes.COLLECT_PRIVILEGES_URL);
    }

    add_role(data: object) {
        return axios.post(apiRoutes.ADD_ROLE_URL, {
            data,
        });
    }

    edit_role(data: object, id: number) {
        return axios.put(apiRoutes.EDIT_ROLE_URL + id, {
            data,
        });
    }

    delete_role(id: number) {
        return axios.delete(apiRoutes.DELETE_ROLE_URL + id);
    }
}

export default new RolesService();
