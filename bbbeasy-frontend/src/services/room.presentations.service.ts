/**
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBEasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

import { axiosInstance } from '../lib/AxiosInstance';
import { apiRoutes } from '../routing/backend-config';

class RoomPresentationsService {
     list_roomPresentations(room_id) {
         return axiosInstance.get(apiRoutes.LIST_ROOM_PRESENTATIONS_URL + room_id);
     }

     add_roomPresentations(url_file: string, room_id: number) {
         return axiosInstance.post(apiRoutes.ADD_ROOM_PRESENTATIONS_URL, {
             url_file,
             room_id,
         });
     }

     delete_roomPresentations(id: number) {
         return axiosInstance.delete(apiRoutes.DELETE_ROOM_PRESENTATIONS_URL + id);
     }

}

export default new RoomPresentationsService();
