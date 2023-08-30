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

import { PageHeader } from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';

import { Avatar, Badge, Card, Col, Dropdown, Row, Space, Tag, Typography, Menu, Button, Modal, Tooltip } from 'antd';
import { ClockCircleOutlined, MoreOutlined, TeamOutlined, WarningOutlined } from '@ant-design/icons';

import Notifications from './Notifications';
import AddRoomForm from './AddRoomForm';
import { DataContext } from 'lib/RoomsContext';
import LoadingSpinner from './LoadingSpinner';
import EmptyData from './EmptyData';

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
    const [isShown, setIsShown] = useState<boolean>(false);
    const labels = [];
    const navigate = useNavigate();
    room.labels.map((item) => {
        labels.push(item);
    });

    //view
    const showRoomDetails = () => {
        navigate('/r/' + room.short_link, { state: { room: room, editable: editable } });
    };

    //delete
    const handleDelete = () => {
        Modal.confirm({
            wrapClassName: 'delete-wrap',
            title: null,
            icon: null,
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
        <Col key={index} span={5} className="custom-col-5 room-box">
            <Card
                hoverable
                onMouseOver={() => setIsShown(true)}
                onMouseLeave={() => setIsShown(false)}
                bordered={false}
                title={
                    <div onClick={() => showRoomDetails()}>
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
                                    <Avatar size={80} className="bbbeasy-btn">
                                        {room.name.slice(0, 2).toUpperCase()}
                                    </Avatar>
                                </Badge>
                            </Badge>
                            <Tooltip title={room.name} placement="top">
                                <Title level={4} className="room-title">
                                    {room.name}
                                </Title>
                            </Tooltip>
                        </Space>
                    </div>
                }
                extra={
                    isShown && (
                        <Dropdown
                            key="more"
                            overlay={actions}
                            placement={LocaleService.direction == 'rtl' ? 'bottomLeft' : 'bottomRight'}
                            trigger={['click']}
                        >
                            <MoreOutlined />
                        </Dropdown>
                    )
                }
            >
                <div className="room-card-body room-labels">
                    {room.labels.map((item) => (
                        <>
                            <Tooltip
                                key={item.name}
                                overlayClassName="install-tooltip"
                                title={
                                    <ul>
                                        {room.labels.map((myItem) => {
                                            const myLabel = myItem.name;

                                            return (
                                                <li key={item.name + '_' + myItem.name}>
                                                    <Tag key={myItem.id} color={myItem.color}>
                                                        {myLabel}
                                                    </Tag>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                }
                            >
                                <Tag className="room-label" key={item.id} color={item.color}>
                                    {item.name}
                                </Tag>
                            </Tooltip>
                        </>
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
    const addSteps = ['give-it-name', 'assign-preset', 'mark-labels'];

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
                <LoadingSpinner className="mt-30 content-center" />
            ) : rooms.length == 0 ? (
                AuthService.isAllowedAction(actions, 'add') ? (
                    <Paragraph className="text-center home-guide">
                        <Title level={2}>
                            <Trans i18nKey="create-easy-room" />
                        </Title>
                        <Row justify="center">
                            {addSteps.map((addStep, index) => (
                                <Col key={index} span={5}>
                                    <Avatar
                                        size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 85, xxl: 100 }}
                                        className="bbbeasy-btn"
                                    >
                                        {index + 1}
                                    </Avatar>
                                    <Title level={4}>
                                        <Trans i18nKey={addStep} />
                                    </Title>
                                </Col>
                            ))}
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
                    <EmptyData description={<Trans i18nKey="no_rooms" />} />
                )
            ) : (
                <>
                    <PageHeader
                        title={<Trans i18nKey="rooms" />}
                        extra={
                            AuthService.isAllowedAction(actions, 'add') && [
                                <Button key="1" type="primary" onClick={() => setIsModalVisible(true)}>
                                    <Trans i18nKey="new_room" />
                                </Button>,
                                <AddRoomForm
                                    key="1"
                                    isModalShow={isModalVisible}
                                    close={() => {
                                        setIsModalVisible(false);
                                    }}
                                    shortlink={initialAddValues.shortlink}
                                    initialAddValues={initialAddValues}
                                />,
                            ]
                        }
                    />
                    <Row gutter={[18, 18]} className="rooms-cards">
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
                </>
            )}
        </>
    );
};

export default withTranslation()(Rooms);
