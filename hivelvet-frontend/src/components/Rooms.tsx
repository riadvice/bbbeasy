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
import { Trans, withTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';

import {
    Avatar,
    Badge,
    Card,
    Col,
    Dropdown,
    Row,
    Space,
    Tag,
    Typography,
    Menu,
    Spin,
    Button,
    Empty,
    Modal,
} from 'antd';
import { ClockCircleOutlined, MoreOutlined, TeamOutlined, WarningOutlined } from '@ant-design/icons';

import Notifications from './Notifications';
import AddRoomForm from './AddRoomForm';
import { DataContext } from 'lib/RoomsContext';

import LocaleService from '../services/locale.service';
import RoomsService from 'services/rooms.service';
import AuthService from 'services/auth.service';

import { RoomType } from 'types/RoomType';
import { PresetType } from 'types/PresetType';
import { LabelType } from 'types/LabelType';
import { getRandomString } from 'types/getRandomString';

const { Title, Paragraph } = Typography;

interface RoomsColProps {
    index: number;
    room: RoomType;
    editable: boolean;
    deleteClickHandler: () => void;
}

const RoomsCol: React.FC<RoomsColProps> = ({ index, room, editable, deleteClickHandler }) => {
    const labels = [];
    const navigate = useNavigate();
    room.labels.map((item) => {
        labels.push(item);
    });

    //view
    const showRoomDetails = () => {
        navigate('/hv/' + room.short_link, { state: { room: room, editable: editable } });
    };

    //delete
    const handleDelete = () => {
        Modal.confirm({
            wrapClassName: 'delete-wrap',
            title: undefined,
            icon: undefined,
            content: (
                <>
                    <WarningOutlined className="delete-icon" />
                    <span className="ant-modal-confirm-title">
                        <Trans i18nKey="delete_room_confirm" />
                    </span>
                </>
            ),
            okType: 'danger',
            okText: <Trans i18nKey="confirm_yes" />,
            cancelText: <Trans i18nKey="confirm_no" />,
            onOk: () => deleteClickHandler(),
        });
    };

    const actions = (
        <Menu>
            {deleteClickHandler != null && (
                <Menu.Item key="2" danger onClick={() => handleDelete()}>
                    <Trans i18nKey={'delete'} />
                </Menu.Item>
            )}
        </Menu>
    );

    return (
        <Col key={index} span={5} className="custom-col-5">
            <Card
                hoverable
                onClick={() => showRoomDetails()}
                bordered={false}
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

type formType = {
    name?: string;
    shortlink?: string;
    preset?: PresetType;
    labels?: LabelType[];
};

const Rooms = () => {
    const dataContext = React.useContext(DataContext);
    const [rooms, setRooms] = React.useState<RoomType[]>(dataContext.dataRooms);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [actions, setActions] = React.useState<string[]>([]);

    useEffect(() => {
        RoomsService.list_rooms(AuthService.getCurrentUser().id)
            .then((response) => {
                setRooms(response.data);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setIsLoading(false);
            });

        const roomsActions = AuthService.getActionsPermissionsByGroup('rooms');
        setActions(roomsActions);
    }, []);

    //add
    const initialAddValues: formType = {
        name: '',
        shortlink: getRandomString(),
        preset: null,
        labels: [],
    };
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);

    //delete
    const deleteRoom = (id) => {
        RoomsService.delete_room(id)
            .then(() => {
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

    return (
        <>
            {isLoading ? (
                <Spin size="large" className="mt-30 content-center" />
            ) : rooms.length == 0 ? (
                AuthService.isAllowedAction(actions, 'add') ? (
                    <Paragraph className="text-center home-guide">
                        <Title level={2}>
                            <Trans i18nKey="create-easy-room" />
                        </Title>
                        <Row justify="center">
                            <Col span={5}>
                                <Avatar
                                    size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 85, xxl: 100 }}
                                    className="ant-btn-primary hivelvet-btn"
                                >
                                    1
                                </Avatar>
                                <Title level={4}>
                                    <Trans i18nKey="give-it-name" />
                                </Title>
                            </Col>
                            <Col span={5}>
                                <Avatar
                                    size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 85, xxl: 100 }}
                                    className="ant-btn-primary hivelvet-btn"
                                >
                                    2
                                </Avatar>
                                <Title level={4}>
                                    <Trans i18nKey="assign-preset" />
                                </Title>
                            </Col>
                            <Col span={5}>
                                <Avatar
                                    size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 85, xxl: 100 }}
                                    className="ant-btn-primary hivelvet-btn"
                                >
                                    3
                                </Avatar>
                                <Title level={4}>
                                    <Trans i18nKey="mark-labels" />
                                </Title>
                            </Col>
                        </Row>
                        <Button type="primary" onClick={() => setIsModalVisible(true)}>
                            <Trans i18nKey="create-first-room" />
                        </Button>
                        <AddRoomForm
                            isModalShow={isModalVisible}
                            close={() => {
                                setIsModalVisible(false);
                            }}
                            shortlink={initialAddValues.shortlink}
                            initialAddValues={initialAddValues}
                        />
                    </Paragraph>
                ) : (
                    <Empty className="mt-30" />
                )
            ) : (
                <Row gutter={10} className="rooms-cards">
                    {rooms.map((singleRoom, index) => (
                        <RoomsCol
                            key={index + '-' + singleRoom.name}
                            index={index}
                            room={singleRoom}
                            editable={AuthService.isAllowedAction(actions, 'edit')}
                            deleteClickHandler={
                                AuthService.isAllowedAction(actions, 'delete')
                                    ? deleteRoom.bind(this, singleRoom.id)
                                    : null
                            }
                        />
                    ))}
                </Row>
            )}
        </>
    );
};

export default withTranslation()(Rooms);
