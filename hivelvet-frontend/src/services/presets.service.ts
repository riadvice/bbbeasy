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
class PresetsService {
    add_preset(data) {
        return axios.post(apiRoutes.ADD_PRESET_URL, {
            data,
        });
    }

    collect_my_presets() {
        return axios.get(apiRoutes.COLLECT_MY_PRESETS_URL);
    }

    edit_subcategory_preset(data: object, id: number) {
        return axios.put(apiRoutes.EDIT_PRESETS_SUBCATEGORIES_URL + id, {
            data,
        });
    }
    edit_preset(data: object, id: number) {
        return axios.put(apiRoutes.EDIT_PRESETS_URL + id, {
            data,
        });
    }
    delete_preset(id: number) {
        return axios.delete(apiRoutes.DELETE_PRESET_URL + id);
    }
}

export default new PresetsService();
