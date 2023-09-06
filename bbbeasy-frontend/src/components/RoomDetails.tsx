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

import React, { useEffect, useState } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { FacebookShareButton, LinkedinShareButton, TwitterShareButton } from 'react-share';

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
import NoData from './NoData';

const { Title } = Typography;
const { Option } = Select;

type formType = {
    name: string;
};

type editFormItemType = {
    item: string;
    label: JSX.Element;
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
        <Tooltip key="tooltipLabels" overlayClassName="install-tooltip" title={label}>
            <Tag
                className="room-label"
                color={value}
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
            >
                {label}
            </Tag>
        </Tooltip>
    );
};

const RoomDetails = () => {
    const { state } = useLocation();
    const param = useParams();
    const [startForm] = Form.useForm();

    const [room, setRoom] = React.useState<RoomType>(state ? state.room : null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [canStart, setCanStart] = useState<boolean>(false);
    const dataContext = React.useContext(DataContext);

    const [errorsEdit, setErrorsEdit] = React.useState({});
    const [showSocialMedia, setShowSocialMedia] = useState(false);
    const [showStartButton, setShowStartButton] = useState(true);
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const [labels, setLabels] = React.useState<LabelType[]>();
    const [presets, setPresets] = React.useState<PresetType[]>();
    const prefixShortLink = '/r/';
    const [showRecodingAndPresenttaions, setShowRecodingAndPresenttaions] = React.useState<boolean>(false);
    const [open, setOpen] = React.useState<boolean>(false);
    const [roomRecordings, setRoomRecordings] = React.useState<RecordingType[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    const currentUser: UserType = AuthService.getCurrentUser();

    const navigate = useNavigate();

    const validateInput = (rule, value) => {
        if (value && value.length > 256) {
            const message = t('room_name.maxSize');
            return Promise.reject(new Error(message));
        } else if (value && value.length < 4) {
            const message = t('room_name.minSize');
            return Promise.reject(new Error(message));
        }
        return Promise.resolve();
    };

    const validInput = () => {
        return Promise.resolve();
    };

    const startRoom = async () => {
        try {
            const values = await startForm.validateFields();

            RoomsService.start_room(room.id, values.fullname)
                .then((result) => {
                    window.open(result.data, '_self');
                })
                .catch((error) => {
                    console.log(error.response.data);
                    Notifications.openNotificationWithIcon(
                        'error',
                        t(Object.keys(EN_US).filter((elem) => EN_US[elem] === error.response.data.meeting))
                    );
                });
        } catch (errInfo) {
            console.log('could not start or join the meeting :', errInfo);
        }
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

        RecordingsService.list_recordings(id)
            .then((response) => {
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
                console.log(currentUser?.role);
                setRoom(response.data.room);
                if (room != null) {
                    setRoom(room);

                    setOpen(true);
                    if (room.user_id == currentUser?.id || currentUser?.role == 'administrator') {
                        getRoomRecordings(room.id);
                        setShowRecodingAndPresenttaions(true);
                        setShowSocialMedia(true);
                    }
                }
                if (meeting != null) {
                    setCanStart(meeting.canStart);

                    setIsRunning(meeting.running);
                }
            })
            .catch((error) => {
                console.log(error);
                navigate('/login');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        //Runs only on the first render
        checkRoomStarted();
        getPresets();
        getLabels();
    }, []);

    //edit
    const [editForm] = Form.useForm();

    const editFormItems: editFormItemType[] = [
        {
            item: 'name',
            label: <Trans i18nKey="name.label" />,
            formItemNode: <Input />,
            isRequired: true,
        },
        {
            item: 'preset_id',
            label: <Trans i18nKey="preset.label" />,
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
            label: <Trans i18nKey="labels" />,
            formItemNode: (
                <Select
                    mode="multiple"
                    showArrow
                    tagRender={tagRender}
                    style={{ width: '100%' }}
                    options={labels}
                    notFoundContent={<NoData description={<Trans i18nKey="no_labels" />} className="empty-labels" />}
                />
            ),
        },
        {
            item: 'short_link',
            label: <Trans i18nKey="shortlink.label" />,
            formItemNode: <Input addonBefore={prefixShortLink} defaultValue={room?.short_link} />,
            isRequired: true,
            messageItem: 'shortlink',
        },
    ];
    const toggleEdit = () => {
        setIsEditing(true);
        setShowSocialMedia(false);
        setShowStartButton(false);

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
        setShowSocialMedia(true);
        setShowStartButton(true);
    };

    const labelUpdated = (labels_data, new_labels) => {
        if (labels_data.length != new_labels.length) {
            return true;
        } else {
            for (const label of new_labels) {
                if (!labels_data.includes(label)) {
                    return true;
                }
            }
        }
        return false;
    };

    const cancelEditRoom = () => {
        const labels_data = [];
        room.labels.forEach((label) => {
            labels_data.push(label.color);
        });

        const name = editForm.getFieldValue('name');
        const short_link = editForm.getFieldValue('short_link');
        const presetId = editForm.getFieldValue('preset_id');
        const labels = editForm.getFieldValue('labels');
        if (
            !labelUpdated(labels_data, labels) &&
            name == room.name &&
            short_link == room.short_link &&
            presetId == room.preset_id
        ) {
            cancelEdit();
        }
    };

    const handleSaveEdit = async () => {
        setErrorsEdit({});
        setShowSocialMedia(true);
        setShowStartButton(true);
        try {
            const values = (await editForm.validateFields()) as formType;
            RoomsService.edit_room(values, room.id)
                .then((response) => {
                    if (response.data.result === 'FAILED') {
                        Notifications.openNotificationWithIcon('info', t('no_changes'));
                        cancelEdit();
                    } else {
                        setRoom(response.data.room);
                        const index = dataContext.dataRooms.findIndex((item) => room.id === item.id);

                        if (index !== -1) {
                            dataContext.dataRooms[index] = response.data.room;
                        }
                        Notifications.openNotificationWithIcon('success', t('edit_room_success'));
                        cancelEdit();
                    }
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
        const { item, formItemNode, isRequired, messageItem, label } = editFormItem;

        return (
            <Form.Item
                name={item}
                {...(item in errorsEdit && {
                    help: <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsEdit[item])} />,
                    validateStatus: 'error',
                })}
                label={label}
                rules={[
                    {
                        required: isRequired && true,
                        message: <Trans i18nKey={(messageItem ?? item) + '.required'} />,
                    },
                    // Add a custom rule for the 'name' field only
                    { validator: item === 'name' ? validateInput : validInput },
                ]}
            >
                {formItemNode}
            </Form.Item>
        );
    };
    const renderLinkOrUsername = (open) => {
        if (currentUser != null) {
            return (
                <Input
                    id={'room-shortlink'}
                    readOnly
                    defaultValue={window.location.origin + prefixShortLink + room.short_link}
                    prefix={<LinkOutlined />}
                    suffix={
                        <CopyTextToClipBoard textToCopy={window.location.origin + prefixShortLink + room?.short_link} />
                    }
                />
            );
        } else {
            return (
                <Form form={startForm}>
                    {' '}
                    <Form.Item
                        name="fullname"
                        label={t('fullname.label')}
                        rules={[
                            {
                                required: true,
                                message: <Trans i18nKey="fullname.required" />,
                            },
                        ]}
                    >
                        <Input placeholder={t('fullname.label')} />
                    </Form.Item>
                </Form>
            );
        }
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
                                    {!isEditing && showRecodingAndPresenttaions ? (
                                        <Button
                                            className="edit-btn"
                                            size="small"
                                            type="link"
                                            icon={<EditOutlined />}
                                            onClick={toggleEdit}
                                            disabled={!canStart}
                                        >
                                            {t('edit')}
                                        </Button>
                                    ) : (
                                        <>
                                            {isEditing && (
                                                <Space size={'middle'}>
                                                    <Popconfirm
                                                        title={t('cancel_edit')}
                                                        placement="leftTop"
                                                        onConfirm={() => cancelEdit()}
                                                    >
                                                        <Button
                                                            size="middle"
                                                            onClick={() => cancelEditRoom()}
                                                            className="cell-input-cancel"
                                                        >
                                                            <Trans i18nKey="cancel" />
                                                        </Button>
                                                    </Popconfirm>
                                                    <Button size="middle" onClick={handleSaveEdit} type="primary">
                                                        <Trans i18nKey="save" />
                                                    </Button>
                                                </Space>
                                            )}
                                        </>
                                    )}
                                </Row>
                                <Card bordered={false} className="room-details gray-bg">
                                    <Row justify="center" align="middle">
                                        <Col span={22}>
                                            <Space
                                                direction="vertical"
                                                size="large"
                                                className={isEditing ? 'edit-room-form' : null}
                                            >
                                                {!isEditing ? (
                                                    <>
                                                        <Title level={3}>{room.name}</Title>
                                                        {currentUser != null ? (
                                                            <>
                                                                <div>
                                                                    {room.labels.map((item) => (
                                                                        <Tag key={item.id} color={item.color}>
                                                                            {item.name}
                                                                        </Tag>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        ) : null}

                                                        {renderLinkOrUsername(open)}
                                                    </>
                                                ) : (
                                                    <Space size="middle" className="edit-room-form">
                                                        <Form form={editForm} labelAlign="left" labelCol={{ span: 11 }}>
                                                            {editFormItems.map((editFormItem) => {
                                                                return customFormItem(editFormItem);
                                                            })}
                                                        </Form>
                                                    </Space>
                                                )}
                                                {showSocialMedia && (
                                                    <div className="medias">
                                                        <Space size="middle">
                                                            <Tooltip
                                                                placement="bottom"
                                                                title={<Trans i18nKey="facebook_share" />}
                                                            >
                                                                <FacebookShareButton
                                                                    url={
                                                                        window.location.origin +
                                                                        prefixShortLink +
                                                                        room?.short_link
                                                                    }
                                                                    quote={'Join us!'}
                                                                >
                                                                    <FacebookOutlined />
                                                                </FacebookShareButton>
                                                            </Tooltip>
                                                            <Tooltip
                                                                placement="bottom"
                                                                title={<Trans i18nKey="twitter_share" />}
                                                            >
                                                                <TwitterShareButton
                                                                    url={
                                                                        window.location.origin +
                                                                        prefixShortLink +
                                                                        room?.short_link
                                                                    }
                                                                >
                                                                    <TwitterOutlined />
                                                                </TwitterShareButton>
                                                            </Tooltip>
                                                            <Tooltip
                                                                placement="bottom"
                                                                title={<Trans i18nKey="linkedin_share" />}
                                                            >
                                                                <LinkedinShareButton
                                                                    url={
                                                                        window.location.origin +
                                                                        prefixShortLink +
                                                                        room?.short_link
                                                                    }
                                                                >
                                                                    <LinkedinOutlined />
                                                                </LinkedinShareButton>
                                                            </Tooltip>
                                                        </Space>
                                                    </div>
                                                )}
                                            </Space>
                                        </Col>
                                        {showStartButton && (
                                            <Col span={2}>
                                                <a onClick={startRoom}>
                                                    <Avatar
                                                        size={{ xs: 40, sm: 64, md: 85, lg: 100, xl: 120, xxl: 140 }}
                                                        className={'bbbeasy-btn'}
                                                    >
                                                        <Trans i18nKey={canStart && !isRunning ? 'start' : 'join'} />
                                                    </Avatar>
                                                </a>
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            </Col>
                            <Col span={8} offset={6} className="RoomPresentation">
                                <RoomPresentations open={showRecodingAndPresenttaions} />
                            </Col>
                        </Row>
                        <RoomRecordings
                            id={room.id}
                            loading={loading}
                            roomRecordings={roomRecordings}
                            open={showRecodingAndPresenttaions}
                        />
                    </div>
                )
            )}
        </>
    );
};

export default withTranslation()(RoomDetails);
