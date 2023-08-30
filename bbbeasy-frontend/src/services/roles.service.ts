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

class RolesService {
    list_roles() {
        return axiosInstance.get(apiRoutes.LIST_ROLE_URL);
    }

    collect_roles() {
        return axiosInstance.get(apiRoutes.COLLECT_ROLES_URL);
    }

    list_permissions() {
        return axiosInstance.get(apiRoutes.COLLECT_PRIVILEGES_URL);
    }

    add_role(data: object) {
        return axiosInstance.post(apiRoutes.ADD_ROLE_URL, {
            data,
        });
    }

    edit_role(data: object, id: number) {
        return axiosInstance.put(apiRoutes.EDIT_ROLE_URL + id, {
            data,
        });
    }

    delete_role(id: number) {
        return axiosInstance.delete(apiRoutes.DELETE_ROLE_URL + id);
    }
}

export default new RolesService();
