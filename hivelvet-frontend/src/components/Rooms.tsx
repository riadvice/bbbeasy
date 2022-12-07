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

import React, { useEffect } from 'react';
import RoomsService from '../services/rooms.service';

import { FormInstance } from 'antd/lib/form';
import { withTranslation } from 'react-i18next';

import _ from 'lodash';

import { Navigate } from 'react-router-dom';
import { RoomType } from 'types/RoomType';

type formType = {
    name?: string;
    description?: string;
    color?: string;
};
const addForm: FormInstance = null;

const Rooms = () => {
    const [data, setData] = React.useState<RoomType[]>([]);

    const getRooms = () => {
        RoomsService.list_rooms()
            .then((response) => {
                console.log(response.data);
                setData(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    };
    useEffect(() => {
        getRooms();
        //Runs only on the first render
    }, []);
    if (!data) {
        return <Navigate to="/home" />;
    } else {
        return <>Rooms</>;
    }
};
export default withTranslation()(Rooms);
