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

import React, { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { t } from 'i18next';

import { Button, Card, Col, Dropdown, Input, Row, Space, Typography, Menu, Form, Popconfirm } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    MoreOutlined,
    SearchOutlined,
    ShareAltOutlined,
    TeamOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import DynamicIcon from './DynamicIcon';
import LoadingSpinner from './LoadingSpinner';
import EmptyData from './EmptyData';
import EN_US from '../locale/en-US.json';

import LocaleService from '../services/locale.service';

import { RecordingType } from '../types/RecordingType';
import { MenuProps } from 'antd/lib/menu';
import recordingsService from 'services/recordings.service';

import Notifications from './Notifications';

const { Title } = Typography;

type Props = {
    loading: boolean;
    roomRecordings: RecordingType[];
    open: boolean;
    id: any;
};
type formType = {
    name: string;
};

const RoomRecordings = (props: Props) => {
    const { loading, roomRecordings, open, id } = props;

    const [isLoading, setIsLoading] = React.useState<boolean>(loading);
    const [recordings, setRecordings] = React.useState<RecordingType[]>([]);
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const [errorsEdit, setErrorsEdit] = React.useState({});

    const [editForm] = Form.useForm();
    const getRoomRecordings = (id) => {
        setIsLoading(true);

        recordingsService
            .list_recordings(id)
            .then((response) => {
                setRecordings(response.data);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    useEffect(() => {
        //Runs only on the first render
        getRoomRecordings(id);
    }, []);
    const toggleEdit = (record) => {
        setIsEditing(true);
        editForm.setFieldsValue({ name: record.name });
    };
    const publish = (key, publish) => {
        recordingsService
            .publish_recording(key, publish)
            .then((result) => {
                setIsLoading(true);
                const newRow: RecordingType = result.data.recording;
                const index = roomRecordings.findIndex((item) => key === item.key);

                if (index !== -1 && newRow) {
                    roomRecordings[index] = newRow;

                    setRecordings(roomRecordings);
                }
                if (publish) {
                    Notifications.openNotificationWithIcon('success', t('publish_record_success'));
                } else {
                    Notifications.openNotificationWithIcon('success', t('unpublish_record_success'));
                }
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    const deleteRecord = (key) => {
        setIsLoading(true);

        recordingsService
            .delete_recording(key)

            .then((result) => {
                setRecordings(() => roomRecordings.filter((record) => record.key !== key));

                Notifications.openNotificationWithIcon('success', t('delete_recording_success'));
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    const cancelEdit = () => {
        setErrorsEdit({});
        setIsEditing(false);
    };

    const handleSaveEdit = async (recording) => {
        setErrorsEdit({});
        try {
            const values = (await editForm.validateFields()) as formType;

            recordingsService
                .edit_recording(values, recording.key)
                .then((response) => {
                    setIsLoading(true);
                    const newRow: RecordingType = response.data.recording;
                    const index = roomRecordings.findIndex((item) => recording.key === item.key);

                    if (index !== -1 && newRow) {
                        roomRecordings[index] = newRow;

                        setRecordings(roomRecordings);
                        Notifications.openNotificationWithIcon('success', t('edit_recording_success'));
                    }

                    cancelEdit();
                })
                .catch((error) => {
                    const responseData = error.response.data;
                    if (responseData.errors) {
                        setErrorsEdit(responseData.errors);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    const actionsItems = (record) => {
        return (
            <Menu>
                <Menu.Item key="1" onClick={() => toggleEdit(record)}>
                    <Trans i18nKey="rename" />
                </Menu.Item>
                <Menu.Item key="2" onClick={() => publish(record.key, record.state == 'published' ? false : true)}>
                    <Trans i18nKey={record.state == 'published' ? 'unpublish' : 'publish'} />
                </Menu.Item>

                <Menu.Item key="3" danger onClick={() => deleteRecord(record.key)}>
                    <Trans i18nKey="delete" />
                </Menu.Item>
            </Menu>
        );
    };

    return (
        <>
            {open && (
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
                    {isLoading ? (
                        <LoadingSpinner className="mt-30 content-center" />
                    ) : recordings.length != 0 ? (
                        <Row gutter={[16, 20]} className="room-recordings-body">
                            {recordings.map((recording) => {
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
                                                    <img
                                                        src="/images/meeting.png"
                                                        style={{ 'width': '-webkit-fill-available' }}
                                                        height={220}
                                                    />
                                                    <div className="recording-cover">
                                                        {!isEditing ? (
                                                            <div className="recording-header">
                                                                <Title level={3} style={{ height: addHeight }}>
                                                                    {recordingName}
                                                                </Title>
                                                                <Dropdown
                                                                    key="more"
                                                                    overlay={actionsItems(recording)}
                                                                    placement={
                                                                        LocaleService.direction == 'rtl'
                                                                            ? 'bottomLeft'
                                                                            : 'bottomRight'
                                                                    }
                                                                >
                                                                    <MoreOutlined />
                                                                </Dropdown>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="recording-header">
                                                                    <Form form={editForm}>
                                                                        <Form.Item
                                                                            name="name"
                                                                            className="input-editable"
                                                                            {...('name' in errorsEdit && {
                                                                                help: (
                                                                                    <Trans
                                                                                        i18nKey={Object.keys(
                                                                                            EN_US
                                                                                        ).filter(
                                                                                            (elem) =>
                                                                                                EN_US[elem] ==
                                                                                                errorsEdit['name']
                                                                                        )}
                                                                                    />
                                                                                ),
                                                                                validateStatus: 'error',
                                                                            })}
                                                                            rules={[
                                                                                {
                                                                                    required: true,
                                                                                    message: (
                                                                                        <Trans i18nKey="name.required" />
                                                                                    ),
                                                                                },
                                                                            ]}
                                                                        >
                                                                            <Input
                                                                                onPressEnter={handleSaveEdit}
                                                                                suffix={
                                                                                    <>
                                                                                        <Popconfirm
                                                                                            title={t('cancel_edit')}
                                                                                            placement="leftTop"
                                                                                            onConfirm={() =>
                                                                                                cancelEdit()
                                                                                            }
                                                                                        >
                                                                                            <Button
                                                                                                //  style={{"width":"100% !important","height":"100% !important"}}

                                                                                                icon={<CloseOutlined />}
                                                                                                size="small"
                                                                                                className="cell-input-cancel-record"
                                                                                            />
                                                                                        </Popconfirm>
                                                                                        <Button
                                                                                            //     style={{"width":"100% !important","height":"100% !important"}}

                                                                                            icon={<CheckOutlined />}
                                                                                            size="small"
                                                                                            onClick={() =>
                                                                                                handleSaveEdit(
                                                                                                    recording
                                                                                                )
                                                                                            }
                                                                                            type="primary"
                                                                                            className="cell-input-save-record"
                                                                                        />
                                                                                    </>
                                                                                }
                                                                            />
                                                                        </Form.Item>
                                                                    </Form>
                                                                </div>
                                                            </>
                                                        )}

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
                                                                className="bbbeasy-ppt"
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
                                                            icon={<DynamicIcon type="mp4" className="bbbeasy-mp4" />}
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
                        <EmptyData description={<Trans i18nKey="no_recordings" />} />
                    )}
                </div>
            )}
        </>
    );
};

export default RoomRecordings;
