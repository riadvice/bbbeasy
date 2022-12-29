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

import React, { useState } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { t } from 'i18next';
import { Form } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Popconfirm } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

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
import { Avatar, Button, Card, Col, Dropdown, Input, Modal, Row, Space, Tag, Tooltip, Typography, Upload } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { RoomType } from '../types/RoomType';
import { RecordingType } from '../types/RecordingType';
import DynamicIcon from './DynamicIcon';
import { MenuProps } from 'antd/lib/menu';
import LocaleService from '../services/locale.service';
import EN_US from '../locale/en-US.json';
import roomsService from 'services/rooms.service';
import Notifications from './Notifications';
const { Title } = Typography;
type formType = {
    name: string;
};

const RoomDetails = () => {
    const { state } = useLocation();
    const currentRoom: RoomType = state.room;
    const editable: boolean = state.editable;
    const [room, setRoom] = React.useState<RoomType>(state.room);

    const recordings: RecordingType[] = [
        {
            id: 1,
            name: 'English & Spanish Courses Level 1',
            attendees: 2,
            date: 'Mar 28, 2018',
            duration: '3h 56',
        },
        {
            id: 2,
            name: 'English Courses',
            attendees: 10,
            date: 'Mar 20, 2022',
            duration: '2h 00',
        },
        {
            id: 3,
            name: 'English Courses Level 2',
            attendees: 4,
            date: 'Mar 20, 2022',
            duration: '1h 30',
        },
        {
            id: 4,
            name: 'English Course Level 3',
            attendees: 20,
            date: 'Mar 20, 2022',
            duration: '2h 25',
        },
        {
            id: 5,
            name: 'English Course Level 4',
            attendees: 30,
            date: 'Mar 20, 2022',
            duration: '3h 15',
        },
        {
            id: 6,
            name: 'English Course Level 5',
            attendees: 10,
            date: 'Mar 20, 2022',
            duration: '2h 00',
        },
    ];
    const [copied, setCopied] = useState<boolean>(false);
    const [errorsEdit, setErrorsEdit] = React.useState({});

    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
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
    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };
    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);
    const uploadButton = (
        <div>
            <PlusOutlined />
            <div className="mt-8 upload-file">
                <Trans i18nKey="upload" />
            </div>
        </div>
    );
    const [editForm] = Form.useForm();
    const toggleEdit = () => {
        setIsEditing(true);
        editForm.setFieldsValue({ name: room ? room.name : currentRoom.name });
    };
    const cancelEdit = () => {
        setErrorsEdit({});
        setIsEditing(false);
    };
    const handleSaveEdit = async () => {
        setErrorsEdit({});
        try {
            const values = (await editForm.validateFields()) as formType;

            roomsService
                .edit_room(values, currentRoom.id)
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
                    console.log(error);
                });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    return (
        <div className="page-padding">
            <Row align="bottom" className="mb-40">
                <Col span={10}>
                    <Row justify="end" className="mb-5">
                        {!isEditing && editable ? (
                            <Button
                                className="edit-btn"
                                size="small"
                                type="link"
                                icon={<EditOutlined />}
                                onClick={toggleEdit}
                            >
                                {t('rename')}
                            </Button>
                        ) : (
                            <></>
                        )}
                    </Row>
                    <Card bordered={false} className="room-details gray-bg">
                        <Row justify="center" align="middle">
                            <Col span={22}>
                                <Space direction="vertical" size="large">
                                    {!isEditing ? (
                                        <>
                                            <Title level={3}>{room ? room.name : currentRoom.name}</Title>
                                        </>
                                    ) : (
                                        <>
                                            <Form form={editForm}>
                                                <Form.Item
                                                    name="name"
                                                    className="input-editable"
                                                    {...('name' in errorsEdit && {
                                                        help: (
                                                            <Trans
                                                                i18nKey={Object.keys(EN_US).filter(
                                                                    (elem) => EN_US[elem] == errorsEdit['name']
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
                                                    <Input
                                                        className="input"
                                                        onPressEnter={handleSaveEdit}
                                                        suffix={
                                                            <>
                                                                <Popconfirm
                                                                    title={t('cancel_edit')}
                                                                    placement="leftTop"
                                                                    onConfirm={() => cancelEdit()}
                                                                >
                                                                    <Button
                                                                        icon={<CloseOutlined />}
                                                                        size="small"
                                                                        //onClick={cancelEdit}
                                                                        className="cell-input-cancel"
                                                                    />
                                                                </Popconfirm>
                                                                <Button
                                                                    icon={<CheckOutlined />}
                                                                    size="small"
                                                                    onClick={handleSaveEdit}
                                                                    type="primary"
                                                                    className="cell-input-save"
                                                                />
                                                            </>
                                                        }
                                                    />
                                                </Form.Item>
                                            </Form>
                                        </>
                                    )}

                                    <div className="room-labels">
                                        {currentRoom.labels.map((item) => (
                                            <Tag key={item.id} color={item.color}>
                                                {item.name}
                                            </Tag>
                                        ))}
                                    </div>
                                    <Input
                                        id={'room-shortlink'}
                                        readOnly
                                        defaultValue={currentRoom.short_link}
                                        prefix={<LinkOutlined />}
                                        suffix={
                                            copied ? (
                                                <Tooltip title={<Trans i18nKey="copied" />}>
                                                    <CheckOutlined className="text-success" />
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title={<Trans i18nKey="copy_shortlink" />}>
                                                    <CopyToClipboard
                                                        text={currentRoom.short_link}
                                                        onCopy={copyClipboard}
                                                    >
                                                        <CopyOutlined />
                                                    </CopyToClipboard>
                                                </Tooltip>
                                            )
                                        }
                                    />

                                    <div className="medias">
                                        <Space size="middle" className="social-media">
                                            <Tooltip placement="bottom" title={<Trans i18nKey="facebook_share" />}>
                                                <FacebookOutlined />
                                            </Tooltip>
                                            <Tooltip placement="bottom" title={<Trans i18nKey="twitter_share" />}>
                                                <TwitterOutlined />
                                            </Tooltip>
                                            <Tooltip placement="bottom" title={<Trans i18nKey="linkedin_share" />}>
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
                                >
                                    <Trans i18nKey="start" />
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
                        <Input
                            className="search-input"
                            size="middle"
                            placeholder={t('search')}
                            allowClear
                            suffix={<SearchOutlined />}
                            bordered={false}
                        />
                    </Space>
                </div>
                <Row gutter={[16, 20]} className="room-recordings-body">
                    {recordings.map((recording) => {
                        const addHeight = recording.name.length <= 16 ? '65px' : null;
                        const recordingName =
                            recording.name.length <= 24 ? recording.name : recording.name.substring(0, 21) + '...';

                        return (
                            <Col span={6} key={recording.id}>
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
                                                        <TeamOutlined /> {recording.attendees}{' '}
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
                                                icon={<DynamicIcon type="playback-presentation" className="hv-ppt" />}
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
            </div>
        </div>
    );
};

export default withTranslation()(RoomDetails);
