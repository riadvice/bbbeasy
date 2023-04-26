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

import React, { useEffect, useState } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import EN_US from '../locale/en-US.json';
import { t } from 'i18next';

import {
    EditOutlined,
    FacebookOutlined,
    LinkedinOutlined,
    LinkOutlined,
    MailOutlined,
    TwitterOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, Input, Row, Space, Tag, Tooltip, Typography, Form, Select, Popconfirm } from 'antd';

import Notifications from './Notifications';
import { CustomTagProps } from 'rc-select/lib/BaseSelect';
import RoomRecordings from './RoomRecordings';
import RoomPresentations from './RoomPresentations';
import CopyTextToClipBoard from './CopyTextToClipBoard';
import LoadingSpinner from './LoadingSpinner';
import { DataContext } from 'lib/RoomsContext';

import RoomsService from 'services/rooms.service';
import RecordingsService from '../services/recordings.service';
import LabelsService from 'services/labels.service';
import PresetsService from 'services/presets.service';
import AuthService from 'services/auth.service';

import { RoomType } from '../types/RoomType';
import { RecordingType } from '../types/RecordingType';
import { PresetType } from 'types/PresetType';
import { LabelType } from 'types/LabelType';
import { UserType } from '../types/UserType';

const { Title } = Typography;
const { Option } = Select;

type formType = {
    name: string;
};

type editFormItemType = {
    item: string;
    formItemNode: JSX.Element;
    isRequired?: boolean;
    messageItem?: string;
};

const tagRender = (props: CustomTagProps) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };
    return (
        <Tag color={value} onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose}>
            {label}
        </Tag>
    );
};

const RoomDetails = () => {
    const { state } = useLocation();
    const param = useParams();
    const editable: boolean = state?.editable;
    const [room, setRoom] = React.useState<RoomType>(state ? state.room : null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [canStart, setCanStart] = useState<boolean>(false);
    const dataContext = React.useContext(DataContext);

    const [errorsEdit, setErrorsEdit] = React.useState({});
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const [labels, setLabels] = React.useState<LabelType[]>();
    const [presets, setPresets] = React.useState<PresetType[]>();
    const prefixShortLink = '/r/';

    const [roomRecordings, setRoomRecordings] = React.useState<RecordingType[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    const currentUser: UserType = AuthService.getCurrentUser();

    const navigate = useNavigate();

    const startRoom = () => {
        RoomsService.start_room(room.id)
            .then((result) => {
                window.open(result.data, '_self');
            })
            .catch((error) => {
                console.log(error);
                Notifications.openNotificationWithIcon('error', t('meeting_not_started'));
            });
    };
    const getPresets = () => {
        if (currentUser != null) {
            PresetsService.list_presets(currentUser.id).then((result) => {
                setPresets(result.data);
            });
        }
    };
    const getLabels = () => {
        const labels_data = [];
        LabelsService.list_labels().then((result) => {
            result.data.forEach((label) => {
                labels_data.push({ label: label.name, value: label.color });
            });
            setLabels(labels_data);
        });
    };
    const getRoomRecordings = (id) => {
        setLoading(true);
        console.log(id);
        RecordingsService.list_recordings(id)
            .then((response) => {
                console.log(response);
                setRoomRecordings(response.data);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };
    const checkRoomStarted = () => {
        RoomsService.getRoomByLink(param.shortlink)
            .then((response) => {
                const room: RoomType = response.data.room;

                const meeting = response.data.meeting;
                if (room != null) {
                    setRoom(room);
                    getRoomRecordings(room.id);
                }
                if (meeting != null) {
                    setCanStart(meeting.canStart);

                    setIsRunning(meeting.running);
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (currentUser != null) {
            //Runs only on the first render
            checkRoomStarted();
            getPresets();
            getLabels();
        } else {
            navigate('/login');
        }
    }, []);

    //edit
    const [editForm] = Form.useForm();
    const editFormItems: editFormItemType[] = [
        {
            item: 'name',
            formItemNode: <Input />,
            isRequired: true,
        },
        {
            item: 'preset_id',
            formItemNode: (
                <Select
                    className="select-field"
                    showSearch
                    onChange={(val) => editForm.setFieldValue('preset_id', val)}
                    allowClear
                    placeholder={t('preset.label')}
                    defaultValue={room?.preset_id}
                    filterOption={(input, option) =>
                        option.children.toString().toLowerCase().indexOf(input.toString().toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                        optionA.children
                            .toString()
                            .toLowerCase()
                            .localeCompare(optionB.children.toString().toLowerCase())
                    }
                >
                    {presets != null &&
                        presets.map((item) => (
                            <Option key={item.id} value={item.id} className="text-capitalize">
                                {item.name}
                            </Option>
                        ))}
                </Select>
            ),
            isRequired: true,
            messageItem: 'preset',
        },
        {
            item: 'labels',
            formItemNode: (
                <Select mode="multiple" showArrow tagRender={tagRender} style={{ width: '100%' }} options={labels} />
            ),
        },
        {
            item: 'short_link',
            formItemNode: <Input addonBefore={prefixShortLink} defaultValue={room?.short_link} />,
            isRequired: true,
            messageItem: 'shortlink',
        },
    ];
    const toggleEdit = () => {
        setIsEditing(true);

        const labels_data = [];
        room.labels.forEach((label) => {
            labels_data.push(label.color);
        });

        editForm.setFieldsValue({
            name: room.name,
            short_link: room.short_link,
            labels: labels_data,
            preset_id: room.preset_id,
        });
    };
    const cancelEdit = () => {
        setErrorsEdit({});
        setIsEditing(false);
    };
    const handleSaveEdit = async () => {
        setErrorsEdit({});
        try {
            const values = (await editForm.validateFields()) as formType;

            RoomsService.edit_room(values, room.id)
                .then((response) => {
                    setRoom(response.data.room);
                    const index = dataContext.dataRooms.findIndex((item) => room.id === item.id);

                    if (index !== -1) {
                        dataContext.dataRooms[index] = response.data.room;
                    }
                    Notifications.openNotificationWithIcon('success', t('edit_room_success'));
                    cancelEdit();
                })
                .catch((error) => {
                    const responseData = error.response.data;
                    if (responseData.errors) {
                        setErrorsEdit(responseData.errors);
                    }
                });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };
    const customFormItem = (editFormItem: editFormItemType) => {
        const { item, formItemNode, isRequired, messageItem } = editFormItem;

        return (
            <Form.Item
                name={item}
                {...(item in errorsEdit && {
                    help: <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsEdit[item])} />,
                    validateStatus: 'error',
                })}
                rules={[
                    {
                        required: isRequired && true,
                        message: <Trans i18nKey={(messageItem ?? item) + '.required'} />,
                    },
                ]}
            >
                {formItemNode}
            </Form.Item>
        );
    };

    return (
        <>
            {isLoading ? (
                <LoadingSpinner className="mt-30 content-center" />
            ) : (
                room && (
                    <div className="page-padding">
                        <Row align="bottom" className="mb-40">
                            <Col span={10}>
                                <Row justify="end" className="mb-5">
                                    {!isEditing ? (
                                        <Button
                                            className="edit-btn"
                                            size="small"
                                            type="link"
                                            icon={<EditOutlined />}
                                            onClick={toggleEdit}
                                            disabled={room.user_id !== currentUser.id}
                                        >
                                            {t('edit')}
                                        </Button>
                                    ) : (
                                        <>
                                            <Space size={'middle'}>
                                                <Popconfirm
                                                    title={t('cancel_edit')}
                                                    placement="leftTop"
                                                    onConfirm={() => cancelEdit()}
                                                >
                                                    <Button size="middle" className="cell-input-cancel">
                                                        <Trans i18nKey="cancel" />
                                                    </Button>
                                                </Popconfirm>
                                                <Button size="middle" onClick={handleSaveEdit} type="primary">
                                                    <Trans i18nKey="save" />
                                                </Button>
                                            </Space>
                                        </>
                                    )}
                                </Row>
                                <Card bordered={false} className="room-details gray-bg">
                                    <Row justify="center" align="middle">
                                        <Col span={22}>
                                            <Space direction="vertical" size="large">
                                                {!isEditing ? (
                                                    <>
                                                        <Title level={3}>{room.name}</Title>
                                                        <div>
                                                            {room.labels.map((item) => (
                                                                <Tag key={item.id} color={item.color}>
                                                                    {item.name}
                                                                </Tag>
                                                            ))}
                                                        </div>
                                                        <Input
                                                            id={'room-shortlink'}
                                                            readOnly
                                                            defaultValue={prefixShortLink + room.short_link}
                                                            prefix={<LinkOutlined />}
                                                            suffix={
                                                                <CopyTextToClipBoard
                                                                    textToCopy={
                                                                        window.location.origin +
                                                                        prefixShortLink +
                                                                        room?.short_link
                                                                    }
                                                                />
                                                            }
                                                        />
                                                    </>
                                                ) : (
                                                    <Space size="middle" direction="vertical">
                                                        <Form form={editForm}>
                                                            {editFormItems.map((editFormItem) => {
                                                                return customFormItem(editFormItem);
                                                            })}
                                                        </Form>
                                                    </Space>
                                                )}
                                                <div className="medias">
                                                    <Space size="middle">
                                                        <Tooltip
                                                            placement="bottom"
                                                            title={<Trans i18nKey="facebook_share" />}
                                                        >
                                                            <FacebookOutlined />
                                                        </Tooltip>
                                                        <Tooltip
                                                            placement="bottom"
                                                            title={<Trans i18nKey="twitter_share" />}
                                                        >
                                                            <TwitterOutlined />
                                                        </Tooltip>
                                                        <Tooltip
                                                            placement="bottom"
                                                            title={<Trans i18nKey="linkedin_share" />}
                                                        >
                                                            <LinkedinOutlined />
                                                        </Tooltip>
                                                    </Space>
                                                    <Tooltip placement="bottom" title={<Trans i18nKey="email_share" />}>
                                                        <MailOutlined />
                                                    </Tooltip>
                                                </div>
                                            </Space>
                                        </Col>
                                        {(canStart || isRunning) && (
                                            <Col span={2}>
                                                <a onClick={startRoom}>
                                                    <Avatar
                                                        size={{ xs: 40, sm: 64, md: 85, lg: 100, xl: 120, xxl: 140 }}
                                                        className="bbbeasy-btn"
                                                    >
                                                        <Trans i18nKey={canStart ? 'start' : 'join'} />
                                                    </Avatar>
                                                </a>
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            </Col>
                            <Col span={8} offset={6}>
                                <RoomPresentations />
                            </Col>
                        </Row>
                        <RoomRecordings loading={loading} roomRecordings={roomRecordings} />
                    </div>
                )
            )}
        </>
    );
};

export default withTranslation()(RoomDetails);
