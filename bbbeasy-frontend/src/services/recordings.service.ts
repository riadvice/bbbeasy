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

class RecordingsService {
    collect_recordings() {
        return axiosInstance.get(apiRoutes.COLLECT_RECORDINGS_URL);
    }

    list_recordings(roomId: number) {
        return axiosInstance.get(apiRoutes.LIST_RECORDINGS_URL + roomId);
    }

    edit_recording(data: object, id: string) {
        return axiosInstance.put(apiRoutes.EDIT_RECORDING_URL + id, {
            data,
        });
    }
    publish_recording(id: string, data: object) {
        return axiosInstance.put(apiRoutes.PUBLISH_RECORDING_URL + id, {
            data,
        });
    }
    delete_recording(id: string) {
        return axiosInstance.delete(apiRoutes.DELETE_RECORDING_URL + id);
    }
}

export default new RecordingsService();
