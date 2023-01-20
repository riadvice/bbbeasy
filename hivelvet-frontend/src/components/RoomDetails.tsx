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
import { useLocation, useParams } from 'react-router-dom';
import EN_US from '../locale/en-US.json';
import { t } from 'i18next';

import {
    CalendarOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    CopyOutlined,
    EditOutlined,
    FacebookOutlined,
    LinkedinOutlined,
    LinkOutlined,
    MailOutlined,
    MoreOutlined,
    PlusOutlined,
    SearchOutlined,
    ShareAltOutlined,
    TeamOutlined,
    TwitterOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Dropdown,
    Input,
    Modal,
    Row,
    Space,
    Tag,
    Tooltip,
    Typography,
    Upload,
    Empty,
    Form,
    Spin,
    Select,
    Popconfirm,
} from 'antd';

import DynamicIcon from './DynamicIcon';
import Notifications from './Notifications';
import { MenuProps } from 'antd/lib/menu';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CustomTagProps } from 'rc-select/lib/BaseSelect';

import RoomsService from 'services/rooms.service';
import RecordingsService from '../services/recordings.service';
import LocaleService from '../services/locale.service';
import LabelsService from 'services/labels.service';
import PresetsService from 'services/presets.service';
import AuthService from 'services/auth.service';

import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { RoomType } from '../types/RoomType';
import { RecordingType } from '../types/RecordingType';
import { PresetType } from 'types/PresetType';
import { LabelType } from 'types/LabelType';

const { Title } = Typography;
const { Option } = Select;

type formType = {
    name: string;
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

const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const uploadButton = (
    <div>
        <PlusOutlined />
        <div className="mt-8 upload-file">
            <Trans i18nKey="upload" />
        </div>
    </div>
);

const RoomDetails = () => {
    const { state } = useLocation();
    const param = useParams();
    const editable: boolean = state.editable;
    const [room, setRoom] = React.useState<RoomType>(state ? state.room : null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [canStart, setCanStart] = useState<boolean>(false);

    const [copied, setCopied] = useState<boolean>(false);
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [fileList, setFileList] = useState<UploadFile[]>([
        {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        },
        {
            uid: '-2',
            name: 'image.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        },
        {
            uid: '-3',
            name: 'image.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        },
        {
            uid: '-4',
            name: 'image.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        },
    ]);

    const [errorsEdit, setErrorsEdit] = React.useState({});
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const [labels, setLabels] = React.useState<LabelType[]>();
    const [presets, setPresets] = React.useState<PresetType[]>();
    const prefixShortLink = '/hv/';

    const [roomRecordings, setRoomRecordings] = React.useState<RecordingType[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    const getPresets = () => {
        PresetsService.list_presets(AuthService.getCurrentUser().id).then((result) => {
            setPresets(result.data);
        });
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
    const checkRoomStarted = () => {
        RoomsService.getRoomByLink(param.shortlink)
            .then((response) => {
                const room: RoomType = response.data.room;
                const meeting = response.data.meeting;
                if (room != null) {
                    setRoom(room);
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
    const getRoomRecordings = () => {
        setLoading(true);
        RecordingsService.list_recordings(room.id)
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

    useEffect(() => {
        //Runs only on the first render
        checkRoomStarted();
        getPresets();
        getLabels();
        getRoomRecordings();
    }, []);

    //details
    const actionsItems: MenuProps['items'] = [
        {
            key: '1',
            label: <Trans i18nKey="rename" />,
        },
        {
            key: '2',
            label: <Trans i18nKey="publish" />,
        },
        {
            type: 'divider',
        },
        {
            key: '3',
            danger: true,
            label: <Trans i18nKey="delete" />,
        },
    ];
    const copyClipboard = () => {
        setCopied(true);
        setTimeout(
            function () {
                setCopied(false);
            }.bind(this),
            5000
        );
    };

    //ppts
    const handleCancel = () => setPreviewOpen(false);
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };
    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);

    //start
    const startRoom = () => {
        RoomsService.start_room(room.id)
            .then((result) => {
                window.open(result.data, '_blank');
            })
            .catch((error) => {
                console.log(error);
                Notifications.openNotificationWithIcon('error', t('meeting_not_started'));
            });
    };

    //edit
    const [editForm] = Form.useForm();
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

    return (
        <>
            {isLoading ? (
                <Spin size="large" className="mt-30 content-center" />
            ) : (
                room != null && (
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
                                            disabled={room.user_id !== AuthService.getCurrentUser().id}
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
                                                <Button
                                                    size="middle"
                                                    onClick={handleSaveEdit}
                                                    type="primary"
                                                    className="cell-input-save"
                                                >
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
                                                {!isEditing && editable ? (
                                                    <>
                                                        <Title level={3}>{room.name}</Title>
                                                        <div className="room-labels">
                                                            {room.labels.map((item) => (
                                                                <Tag key={item.id} color={item.color}>
                                                                    {item.name}
                                                                </Tag>
                                                            ))}
                                                        </div>
                                                        <Input
                                                            id={'room-shortlink'}
                                                            readOnly
                                                            defaultValue={room.short_link}
                                                            prefix={<LinkOutlined />}
                                                            suffix={
                                                                copied ? (
                                                                    <Tooltip title={<Trans i18nKey="copied" />}>
                                                                        <CheckOutlined className="text-success" />
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Tooltip title={<Trans i18nKey="copy_shortlink" />}>
                                                                        <CopyToClipboard
                                                                            text={room.short_link}
                                                                            onCopy={copyClipboard}
                                                                        >
                                                                            <CopyOutlined />
                                                                        </CopyToClipboard>
                                                                    </Tooltip>
                                                                )
                                                            }
                                                        />
                                                    </>
                                                ) : (
                                                    <Space size="middle" direction="vertical">
                                                        <Form form={editForm}>
                                                            <Form.Item
                                                                name="name"
                                                                className="input-editable"
                                                                {...('name' in errorsEdit && {
                                                                    help: (
                                                                        <Trans
                                                                            i18nKey={Object.keys(EN_US).filter(
                                                                                (elem) =>
                                                                                    EN_US[elem] == errorsEdit['name']
                                                                            )}
                                                                        />
                                                                    ),
                                                                    validateStatus: 'error',
                                                                })}
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: <Trans i18nKey="name.required" />,
                                                                    },
                                                                ]}
                                                            >
                                                                <Input className="input" />
                                                            </Form.Item>
                                                            <Form.Item
                                                                name="preset_id"
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: <Trans i18nKey="preset.required" />,
                                                                    },
                                                                ]}
                                                            >
                                                                <Select
                                                                    className="select-field"
                                                                    showSearch
                                                                    onChange={(val) =>
                                                                        editForm.setFieldValue('preset_id', val)
                                                                    }
                                                                    allowClear
                                                                    placeholder={t('preset.label')}
                                                                    defaultValue={room.preset_id}
                                                                    filterOption={(input, option) =>
                                                                        option.children
                                                                            .toString()
                                                                            .toLowerCase()
                                                                            .indexOf(input.toString().toLowerCase()) >=
                                                                        0
                                                                    }
                                                                    filterSort={(optionA, optionB) =>
                                                                        optionA.children
                                                                            .toString()
                                                                            .toLowerCase()
                                                                            .localeCompare(
                                                                                optionB.children
                                                                                    .toString()
                                                                                    .toLowerCase()
                                                                            )
                                                                    }
                                                                >
                                                                    {presets.map((item) => (
                                                                        <Option
                                                                            key={item.id}
                                                                            value={item.id}
                                                                            className="text-capitalize"
                                                                        >
                                                                            {item.name}
                                                                        </Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                            <Form.Item name="labels">
                                                                <Select
                                                                    mode="multiple"
                                                                    showArrow
                                                                    tagRender={tagRender}
                                                                    style={{ width: '100%' }}
                                                                    options={labels}
                                                                />
                                                            </Form.Item>
                                                            <Form.Item
                                                                name="short_link"
                                                                {...('short_link' in errorsEdit && {
                                                                    help: (
                                                                        <Trans
                                                                            i18nKey={Object.keys(EN_US).filter(
                                                                                (elem) =>
                                                                                    EN_US[elem] ==
                                                                                    errorsEdit['short_link']
                                                                            )}
                                                                        />
                                                                    ),
                                                                    validateStatus: 'error',
                                                                })}
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: <Trans i18nKey="shortlink.required" />,
                                                                    },
                                                                ]}
                                                            >
                                                                <Input
                                                                    addonBefore={prefixShortLink}
                                                                    defaultValue={room.short_link}
                                                                />
                                                            </Form.Item>
                                                        </Form>
                                                    </Space>
                                                )}
                                                <div className="medias">
                                                    <Space size="middle" className="social-media">
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
                                        <Col span={2}>
                                            <Avatar
                                                size={{ xs: 40, sm: 64, md: 85, lg: 100, xl: 120, xxl: 140 }}
                                                className="ant-btn-primary hivelvet-btn"
                                                onClick={startRoom}
                                            >
                                                <Trans i18nKey={canStart ? 'start' : isRunning && 'join'} />
                                            </Avatar>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                            <Col span={8} offset={6}>
                                <Card bordered={false} size="small" className="room-presentations gray-bg">
                                    <Title level={5}>
                                        <Trans i18nKey="room_ppts" />
                                    </Title>
                                    <Upload
                                        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                        listType="picture-card"
                                        fileList={fileList}
                                        onPreview={handlePreview}
                                        onChange={handleChange}
                                    >
                                        {fileList.length >= 8 ? null : uploadButton}
                                    </Upload>
                                </Card>
                                <Modal open={previewOpen} footer={null} onCancel={handleCancel}>
                                    <img className="full-width" src={previewImage} />
                                </Modal>
                            </Col>
                        </Row>

                        <div className="room-recordings">
                            <div className="mb-40">
                                <Space size="middle">
                                    <Title level={4}>
                                        <Trans i18nKey="room_recordings" />
                                    </Title>
                                    {roomRecordings.length != 0 && (
                                        <Input
                                            className="search-input"
                                            size="middle"
                                            placeholder={t('search')}
                                            allowClear
                                            suffix={<SearchOutlined />}
                                            bordered={false}
                                        />
                                    )}
                                </Space>
                            </div>
                            {loading ? (
                                <Spin size="large" className="mt-30 content-center" />
                            ) : roomRecordings.length != 0 ? (
                                <Row gutter={[16, 20]} className="room-recordings-body">
                                    {roomRecordings.map((recording) => {
                                        const addHeight = recording.name.length <= 16 ? '65px' : null;
                                        const recordingName =
                                            recording.name.length <= 24
                                                ? recording.name
                                                : recording.name.substring(0, 21) + '...';

                                        return (
                                            <Col span={6} key={recording.key}>
                                                <Card
                                                    bordered={false}
                                                    hoverable
                                                    cover={
                                                        <div className="recording-box">
                                                            <img src="/images/meeting.png" width={281} height={220} />
                                                            <div className="recording-cover">
                                                                <div className="recording-header">
                                                                    <Title level={3} style={{ height: addHeight }}>
                                                                        {recordingName}
                                                                    </Title>
                                                                    <Dropdown
                                                                        key="more"
                                                                        menu={{ items: actionsItems }}
                                                                        placement={
                                                                            LocaleService.direction == 'rtl'
                                                                                ? 'bottomLeft'
                                                                                : 'bottomRight'
                                                                        }
                                                                    >
                                                                        <MoreOutlined />
                                                                    </Dropdown>
                                                                </div>

                                                                <Space direction="vertical" className="recording-infos">
                                                                    <span>
                                                                        <TeamOutlined /> {recording.users}{' '}
                                                                        <Trans i18nKey="attendees" />{' '}
                                                                    </span>
                                                                    <span>
                                                                        <CalendarOutlined /> {recording.date}
                                                                    </span>
                                                                    <span>
                                                                        <ClockCircleOutlined /> {recording.duration}
                                                                    </span>
                                                                </Space>

                                                                <Button
                                                                    className="share-icon"
                                                                    size="middle"
                                                                    type="primary"
                                                                    shape="circle"
                                                                    icon={<ShareAltOutlined />}
                                                                />
                                                            </div>
                                                        </div>
                                                    }
                                                >
                                                    <Space direction="vertical" size="large">
                                                        <div>
                                                            <Button
                                                                size="middle"
                                                                type="primary"
                                                                icon={
                                                                    <DynamicIcon
                                                                        type="playback-presentation"
                                                                        className="hv-ppt"
                                                                    />
                                                                }
                                                            >
                                                                <span>
                                                                    <Trans i18nKey="replay" />
                                                                </span>
                                                            </Button>
                                                            <span className="file-size">
                                                                35,6 <Trans i18nKey="mb" />
                                                            </span>
                                                        </div>
                                                        <Space size="large" className="actions">
                                                            <div>
                                                                <Button
                                                                    type="primary"
                                                                    ghost
                                                                    icon={<DynamicIcon type="playback-podcast" />}
                                                                />
                                                                <span className="file-size">
                                                                    35,6 <Trans i18nKey="mb" />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <Button
                                                                    type="primary"
                                                                    ghost
                                                                    icon={<DynamicIcon type="DesktopOutlined" />}
                                                                />
                                                                <span className="file-size">
                                                                    35,6 <Trans i18nKey="mb" />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <Button
                                                                    type="primary"
                                                                    ghost
                                                                    icon={<DynamicIcon type="mp4" className="hv-mp4" />}
                                                                />
                                                                <span className="file-size">
                                                                    35,6 <Trans i18nKey="mb" />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <Button
                                                                    type="primary"
                                                                    ghost
                                                                    icon={<DynamicIcon type="activity-reports" />}
                                                                />
                                                                <span className="file-size">
                                                                    35,6 <Trans i18nKey="mb" />
                                                                </span>
                                                            </div>
                                                        </Space>
                                                    </Space>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            ) : (
                                <Empty className="mt-30" />
                            )}
                        </div>
                    </div>
                )
            )}
        </>
    );
};

export default withTranslation()(RoomDetails);
