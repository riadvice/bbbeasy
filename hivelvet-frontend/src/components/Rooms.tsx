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

import React, { useEffect, useState } from 'react';

import { withTranslation } from 'react-i18next';

import { DataContext } from 'lib/RoomsContext';

import Home from './Home';

import { Link, useNavigate } from 'react-router-dom';
import { Trans } from 'react-i18next';

import { Avatar, Badge, Card, Col, Dropdown, Row, Space, Tag, Typography, Menu } from 'antd';

import { RoomType } from 'types/RoomType';

import { ClockCircleOutlined, MoreOutlined, TeamOutlined } from '@ant-design/icons';
import LocaleService from '../services/locale.service';
import { MenuProps } from 'antd/lib/menu';
import { axiosInstance } from 'lib/AxiosInstance';
import roomsService from 'services/rooms.service';
import Notifications from './Notifications';

import { t } from 'i18next';
import authService from 'services/auth.service';
const { Title } = Typography;

interface RoomsColProps {
    index: number;
    room: RoomType;
    rooms: RoomType[];
    deleteClickHandler: () => void;
    //  clickHandler: (room: RoomType) => void;
}

const RoomsCol: React.FC<RoomsColProps> = ({ index, room, rooms, deleteClickHandler }) => {
    const labels = [];
    const navigate = useNavigate();
    room.labels.map((item) => {
        labels.push(item);
    });
    //delete
    const handleDelete = () => {
        deleteClickHandler();
    };
    const actions = (
        <Menu>
            <Menu.Item key="1" onClick={() => navigate('/rooms/details', { state: { room: room } })}>
                <Trans i18nKey={'view'} />
            </Menu.Item>
            <Menu.Item key="2" danger onClick={() => handleDelete()}>
                <Trans i18nKey={'delete'} />
            </Menu.Item>
        </Menu>
    );

    return (
        <Col key={index} span={5} className="custom-col-5">
            <Card
                hoverable
                bordered={false}
                //onClick={() => clickHandler(room)}
                title={
                    <Space size="middle" direction="vertical" className="room-card-title">
                        <Badge
                            offset={LocaleService.direction == 'rtl' ? [22, 11] : [-22, 11]}
                            count={
                                room.id % 2 == 0 ? (
                                    <div className="custom-badge-bg">
                                        <div className="custom-badge">
                                            <ClockCircleOutlined />
                                        </div>
                                    </div>
                                ) : null
                            }
                        >
                            <Badge
                                offset={LocaleService.direction == 'rtl' ? [22, 69] : [-22, 69]}
                                count={
                                    room.id % 2 != 0 ? (
                                        <div className="custom-badge-bg">
                                            <div className="custom-badge">
                                                <TeamOutlined />
                                            </div>
                                        </div>
                                    ) : null
                                }
                            >
                                <Avatar
                                    size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 95 }}
                                    className="hivelvet-btn"
                                >
                                    {room.name.slice(0, 2).toUpperCase()}
                                </Avatar>
                            </Badge>
                        </Badge>
                        <Title level={4}>{room.name}</Title>
                    </Space>
                }
                extra={
                    <Dropdown
                        key="more"
                        overlay={actions}
                        placement={LocaleService.direction == 'rtl' ? 'bottomLeft' : 'bottomRight'}
                    >
                        <MoreOutlined />
                    </Dropdown>
                }
            >
                <div className="room-card-body">
                    {room.labels.map((item) => (
                        <Tag key={item.id} color={item.color}>
                            {item.name}
                        </Tag>
                    ))}
                </div>
            </Card>
        </Col>
    );
};

const Rooms = () => {
    const dataContext = React.useContext(DataContext);
    const [rooms, setRooms] = React.useState<RoomType[]>(dataContext.dataRooms);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const deleteRoom = (id, index) => {
        console.log('delete room');
        roomsService
            .delete_room(id)
            .then((result) => {
                console.log(result);
                setRooms(rooms.filter((r) => r.id != id));
                const indexRoom = dataContext.dataRooms.findIndex((item) => id === item.id);
                if (indexRoom !== -1) {
                    dataContext.dataRooms.splice(indexRoom, 1);
                }
                Notifications.openNotificationWithIcon('success', t('delete_room_success'));
            })
            .catch((error) => {
                console.log(error);
            });
    };
    useEffect(() => {
        roomsService
            .list_rooms(authService.getCurrentUser().id)

            .then((response) => {
                setRooms(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);
    const showRoomDetails = (room: RoomType) => {
        navigate('/rooms/details', { state: { room: room } });
    };

    if (rooms.length == 0) {
        return <Home />;
    } else {
        return (
            <>
                <Row gutter={10} className="rooms-cards">
                    {rooms.map((singleRoom, index) => (
                        <RoomsCol
                            key={index + '-' + singleRoom.name}
                            index={index}
                            room={singleRoom}
                            rooms={rooms}
                            deleteClickHandler={deleteRoom.bind(this, singleRoom.id)}
                            //clickHandler={showRoomDetails}
                        />
                    ))}
                </Row>
            </>
        );
    }
};

export default withTranslation()(Rooms);
