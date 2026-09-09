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

import PageHeader from './PageHeader';
import React, { useEffect, useState } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';

import { Avatar, Badge, Card, Col, Row, Space, Tag, Typography, Button, Modal, Tooltip } from 'antd';
import { ClockCircleOutlined, DeleteOutlined, TeamOutlined, WarningOutlined } from '@ant-design/icons';

import Notifications from './Notifications';
import AddRoomForm from './AddRoomForm';
import { DataContext } from 'lib/RoomsContext';
import LoadingSpinner from './LoadingSpinner';
import EmptyData from './EmptyData';

import LocaleService from '../services/locale.service';
import RoomsService from 'services/rooms.service';
import AuthService from 'services/auth.service';
import notificationService from '../services/notification.service';

import { RoomType } from 'types/RoomType';
import { PresetType } from 'types/PresetType';
import { LabelType } from 'types/LabelType';
import { getRandomString } from 'types/getRandomString';

const { Title, Paragraph } = Typography;

interface RoomsColProps {
    room: RoomType;
    editable: boolean;
    bbbConfigured: boolean;
    deleteClickHandler: () => void;
}

const RoomsCol: React.FC<RoomsColProps> = ({ room, editable, bbbConfigured, deleteClickHandler }) => {
    const navigate = useNavigate();

    //view
    const showRoomDetails = () => {
        // A room cannot be started without a BigBlueButton server, tell the user
        // instead of opening a page where every action fails.
        if (!bbbConfigured) {
            Notifications.openNotificationWithIcon('warning', t('bigbluebutton_not_configured'));
            return;
        }
        navigate(`/r/${room.short_link}`, { state: { room, editable } });
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

    return (
        <Col span={5} className="custom-col-5 room-box">
            <Card
                hoverable
                variant="borderless"
                title={
                    <div onClick={() => showRoomDetails()}>
                        <Space size="middle" orientation="vertical" className="room-card-title">
                            <Badge
                                offset={LocaleService.direction === 'rtl' ? [22, 11] : [-22, 11]}
                                count={
                                    room.id % 2 === 0 ? (
                                        <div className="custom-badge-bg">
                                            <div className="custom-badge">
                                                <ClockCircleOutlined />
                                            </div>
                                        </div>
                                    ) : null
                                }
                            >
                                <Badge
                                    offset={LocaleService.direction === 'rtl' ? [22, 69] : [-22, 69]}
                                    count={
                                        room.id % 2 !== 0 ? (
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
                    /* Delete is the only thing this menu ever held, so it is the
                       button: a menu that hides one action only costs a click. */
                    deleteClickHandler != null && (
                        <Tooltip title={<Trans i18nKey="delete" />}>
                            <Button
                                type="text"
                                danger
                                className="card-more-btn"
                                aria-label={t('delete')}
                                icon={<DeleteOutlined />}
                                onClick={handleDelete}
                            />
                        </Tooltip>
                    )
                }
            >
                <div className="room-card-body room-labels">
                    {room.labels.map((item) => (
                        <Tooltip
                            key={item.key ?? item.id}
                            classNames={{ root: 'install-tooltip' }}
                            title={
                                <ul>
                                    {room.labels.map((myItem) => (
                                        <li key={myItem.key ?? myItem.id}>
                                            <Tag color={myItem.color}>{myItem.name}</Tag>
                                        </li>
                                    ))}
                                </ul>
                            }
                        >
                            <Tag className="room-label" color={item.color}>
                                {item.name}
                            </Tag>
                        </Tooltip>
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
    const [bbbConfigured, setBbbConfigured] = React.useState<boolean>(true);

    React.useEffect(() => {
        notificationService
            .collect_notification()
            .then((response) => setBbbConfigured(response.data.configured))
            .catch(() => setBbbConfigured(false));
    }, []);

    //delete
    const deleteRoom = (id) => {
        RoomsService.delete_room(id)
            .then(() => {
                setRooms((rooms) => rooms.filter((r) => r.id !== id));

                // Through the setter rather than in place, a spliced array keeps the
                // same reference and nothing else reading the context redraws.
                dataContext.setDataRooms((rooms) => rooms.filter((r) => r.id !== id));
                Notifications.openNotificationWithIcon('success', t('delete_room_success'));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return isLoading ? (
        <LoadingSpinner className="mt-30 content-center" />
    ) : rooms.length === 0 ? (
        AuthService.isAllowedAction(actions, 'add') ? (
            <Paragraph className="text-center home-guide">
                <Title level={2}>
                    <Trans i18nKey="create-easy-room" />
                </Title>
                <Row justify="center">
                    {addSteps.map((addStep, index) => (
                        <Col key={addStep} span={5}>
                            <Avatar size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 85, xxl: 100 }} className="bbbeasy-btn">
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
                className="site-page-header rooms-page-header"
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
                {rooms.map((singleRoom) => (
                    <RoomsCol
                        key={singleRoom.id}
                        room={singleRoom}
                        editable={AuthService.isAllowedAction(actions, 'edit')}
                        bbbConfigured={bbbConfigured}
                        deleteClickHandler={
                            AuthService.isAllowedAction(actions, 'delete') ? () => deleteRoom(singleRoom.id) : null
                        }
                    />
                ))}
            </Row>
        </>
    );
};

export default withTranslation()(Rooms);
