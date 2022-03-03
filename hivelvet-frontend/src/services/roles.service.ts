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

class RolesService {
    list_roles() {
        return axios.get(API_URL + '/roles/list');
    }
    list_users() {
        return axios.get(API_URL + '/roles/collect-users');
    }
    list_permissions() {
        return axios.get(API_URL + '/roles/collect-privileges');
    }

    add_role(data: object) {
        return axios.post(API_URL + '/roles/add',{
            data
        });
    }
    edit_role(data: object,id) {
        return axios.put(API_URL + '/roles/edit/'+id,{
            data
        });
    }

    delete_role(id: number) {
        return axios.delete(API_URL + '/roles/delete/'+id);
    }
}

export default new RolesService();
