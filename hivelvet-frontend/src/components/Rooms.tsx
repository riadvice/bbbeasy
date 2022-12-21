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

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import RoomsService from '../services/rooms.service';

import { FormInstance } from 'antd/lib/form';
import { withTranslation } from 'react-i18next';

import _ from 'lodash';

import { Navigate, useLocation } from 'react-router-dom';
import { RoomType } from 'types/RoomType';
import { Badge, Button, Card, Col, Row, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { LabelType } from 'types/LabelType';
import roomsService from '../services/rooms.service';
import { type } from 'os';
import { useReducer } from 'react';
import axios from 'axios';
import { apiRoutes } from 'routing/backend-config';

import { RoomsContext } from 'lib/RoomsContext';
import authService from 'services/auth.service';
import Home from './Home';

type formType = {
    name?: string;
    description?: string;
    color?: string;
};
interface RoomsColProps {
    key: number;
    room: RoomType;
}
const addForm: FormInstance = null;
const RoomsCol: React.FC<RoomsColProps> = ({ key, room }) => {
    const [isShown, setIsShown] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = React.useState<string>('');

    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [errorsEdit, setErrorsEdit] = React.useState({});
    console.log(room.labels);
    const labels = [];
    room.labels.map((item) => {
        labels.push(item);
    });
    console.log(labels);

    const props = {};

    const getName = (item) => {
        return item.replaceAll('_', ' ').charAt(0).toUpperCase() + item.replaceAll('_', ' ').slice(1);
    };

    const handleSaveEdit = async () => {
        setErrorsEdit({});
    };

    return (
        <Col key={key} span={4}>
            <Card
                title={
                    <>
                        <div
                            className="room-card-title"
                            onMouseOver={() => setIsShown(true)}
                            onMouseLeave={() => setIsShown(false)}
                        >
                            <Space>
                                <div
                                    style={{
                                        backgroundColor: '#fbbc0b',
                                    }}
                                    className="profil-btn"
                                >
                                    <span style={{ fontWeight: 'bolder', color: 'white' }}>
                                        {' '}
                                        {room.name.slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <br />
                            </Space>
                        </div>

                        <h4 style={{ 'display': 'flex', 'marginLeft': '20%' }}>{room.name}</h4>
                    </>
                }
            >
                <div className="room-card-body">
                    {room.labels.map((item, subIndex) => {
                        return (
                            <Badge
                                key={item.id}
                                count={item.name}
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />
                        );
                    })}
                </div>
            </Card>
        </Col>
    );
};

const Rooms = () => {
    const [currentUser, setCurrentUser] = useState(authService.getCurrentUser);

    const rooms = React.useContext(RoomsContext);

    useEffect(() => {
        setCurrentUser(authService.getCurrentUser);
        const fetchData = async () => {
            const result = await axios.get(apiRoutes.LIST_ROOMS_URL + currentUser.id);
        };

        fetchData();
    }, [rooms.data]);

    if (rooms.data.length == 0) {
        return <Home />;
    } else {
        return (
            <>
                <Row gutter={10} className="rooms-cards">
                    {rooms.data.map((singleRoom) => (
                        <RoomsCol key={singleRoom.id} room={singleRoom} />
                    ))}
                </Row>
            </>
        );
    }
};

export default withTranslation()(Rooms);
