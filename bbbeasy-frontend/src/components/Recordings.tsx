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

import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';

import { PageHeader } from '@ant-design/pro-layout';

import { Button, Typography, Space, Popconfirm, Input, Tooltip, Modal, Avatar, Tag, Select } from 'antd';
import {
    DeleteOutlined,
    QuestionCircleOutlined,
    UserOutlined,
    EditOutlined,
    ShareAltOutlined,
    FacebookOutlined,
    TwitterOutlined,
    LinkedinOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    InfoCircleOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons';

import Form from 'antd/lib/form';
import DynamicIcon from './DynamicIcon';
import Notifications from './Notifications';
import { CompareRecords } from '../functions/compare.function';
import { EditableTable } from './EditableTable';
import EditableTableCell from './EditableTableCell';
import EditableTableColumnSearch from './EditableTableColumnSearch';

import LocaleService from '../services/locale.service';
import AuthService from '../services/auth.service';
import RecordingsService from '../services/recordings.service';

import { TableColumnType } from '../types/TableColumnType';
import { RecordingType } from '../types/RecordingType';
import CopyTextToClipBoard from './CopyTextToClipBoard';
import {
    FacebookIcon,
    FacebookShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    TwitterIcon,
    TwitterShareButton,
} from 'react-share';

const { Link } = Typography;
const { Option } = Select;

interface EditableCellProps {
    componentName: string;
    editing: boolean;
    children: React.ReactNode;
    dataIndex: keyof RecordingType;
    record: RecordingType;
    inputType: 'text' | 'select';
}

const Recordings = () => {
    const [data, setData] = React.useState<RecordingType[]>([]);
    const [recordingStates, setRecordingStates] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [actions, setActions] = React.useState<string[]>([]);

    const [editingKey, setEditingKey] = React.useState<string>(null);
    const [errorsEdit, setErrorsEdit] = React.useState({});
    const [cancelVisibility, setCancelVisibility] = React.useState<boolean>(false);

    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [modalFormats, setModalFormats] = React.useState<string[]>(null);
    const [modalUrl, setModalUrl] = React.useState<string>(null);

    //list
    const getRecordings = () => {
        setLoading(true);
        RecordingsService.collect_recordings()
            .then((response) => {
                if (response.data.recordings) {
                    setData(response.data.recordings);
                }
                if (response.data.states) {
                    setRecordingStates(response.data.states);
                }
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
        getRecordings();

        const recordingsActions = AuthService.getActionsPermissionsByGroup('recordings');
        recordingsActions.push('share');
        setActions(recordingsActions);
    }, []);
    const getSelectItems = (placeholderText: string, options) => {
        return (
            <Select
                className="select-field"
                showSearch
                allowClear
                placeholder={placeholderText}
                filterOption={(input, option) =>
                    option.children.toString().toLowerCase().indexOf(input.toString().toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                    optionA.children.toString().toLowerCase().localeCompare(optionB.children.toString().toLowerCase())
                }
                onFocus={() => setCancelVisibility(false)}
            >
                {options}
            </Select>
        );
    };
    // edit
    const [editForm] = Form.useForm();
    const EditableCell: React.FC<EditableCellProps> = ({
        editing,
        children,
        dataIndex,
        record,
        inputType,
        ...restProps
    }) => {
        let inputNode: JSX.Element;
        if (inputType === 'select') {
            console.log('select');
            const statesOptions = recordingStates.map((item, index) => (
                <Option key={index} value={item} className="text-capitalize">
                    {t(item)}
                </Option>
            ));

            inputNode = getSelectItems(t('state.placeholder'), statesOptions);
        } else {
            inputNode = <Input onFocus={() => setCancelVisibility(false)} />;
        }
        return (
            <EditableTableCell
                componentName="Recordings"
                editing={editing}
                dataIndex={dataIndex}
                record={record}
                inputNode={inputNode}
                errorsEdit={errorsEdit}
                {...restProps}
            >
                {children}
            </EditableTableCell>
        );
    };
    const toggleEdit = (record: RecordingType) => {
        setCancelVisibility(false);
        setEditingKey(record.key);
        editForm.setFieldsValue(record);
    };
    const isEditing = (record: RecordingType) => record.key == editingKey;
    const cancelEdit = () => {
        setEditingKey(null);
    };
    const saveEdit = async (record: RecordingType) => {
        try {
            const formValues: object = await editForm.validateFields();
            setErrorsEdit({});

            if (!CompareRecords(record, editForm.getFieldsValue(true))) {
                setLoading(true);
                RecordingsService.edit_recording(formValues, record.key)
                    .then((response) => {
                        if (response.data.recording == null) {
                            setData(data.filter((item) => item.key !== record.key));
                            Notifications.openNotificationWithIcon('success', t('delete_recording_success'));
                        } else {
                            const newRowData: RecordingType = response.data.recording;
                            const newData = [...data];
                            const index = newData.findIndex((item) => record.key === item.key);
                            if (index > -1 && newRowData != undefined) {
                                const item = newData[index];
                                newData.splice(index, 1, {
                                    ...item,
                                    ...newRowData,
                                });
                                setData(newData);
                                Notifications.openNotificationWithIcon('success', t('edit_recording_success'));
                                cancelEdit();
                            }
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            } else {
                Notifications.openNotificationWithIcon('info', t('no_changes'));
                cancelEdit();
            }
        } catch (error) {
            console.log(error);
        }
    };

    // delete
    const handleDelete = (key: string) => {
        setLoading(true);
        RecordingsService.delete_recording(key)
            .then(() => {
                const newData = [...data];
                // delete table item
                setData(data.filter((item) => item.key !== key));
                Notifications.openNotificationWithIcon('success', t('delete_recording_success'));
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // share
    const showModal = (formats: string[], url: string) => {
        setIsModalVisible(true);
        setModalFormats(formats);
        setModalUrl(url);
    };
    const cancelShare = () => {
        setIsModalVisible(false);
    };
    const handleShare = () => {
        console.log(modalUrl);
    };

    const getFormatIcons = (formats: string[], showDisabled?: boolean) => {
        const getFormatIcon = (format: string, icon: string, iconClass?: string) => {
            const enabled = formats.includes(format);
            if (enabled || showDisabled) {
                return (
                    <div className={(!enabled && 'disabled ') + (iconClass ?? '')}>
                        <DynamicIcon type={icon} className={!enabled && 'icon-disabled'} />
                    </div>
                );
            }
        };

        return (
            <Space size="middle" className="recording-formats">
                {getFormatIcon('presentation', 'playback-presentation')}
                {getFormatIcon('podcast', 'playback-podcast')}
                {getFormatIcon('screenshare', 'DesktopOutlined', 'icon-desktop')}
                {getFormatIcon('mp4', 'mp4')}
                {getFormatIcon('reports', 'activity-reports')}
            </Space>
        );
    };

    const columns: TableColumnType[] = [
        {
            title: t('name_col'),
            dataIndex: 'name',
            editable: true,
            //width: '35%',
            ...EditableTableColumnSearch('name'),
            sorter: {
                compare: (a, b) => a.name.localeCompare(b.name),
                multiple: 4,
            },
        },
        {
            title: t('date_col'),
            dataIndex: 'date',
            editable: false,
            ...EditableTableColumnSearch('date'),
            sorter: {
                compare: (a, b) => a.date.localeCompare(b.date),
                multiple: 3,
            },
        },
        {
            title: t('duration_col'),
            dataIndex: 'duration',
            editable: false,
            ...EditableTableColumnSearch('duration'),
            sorter: {
                compare: (a, b) => a.duration.localeCompare(b.duration),
                multiple: 2,
            },
        },
        {
            title: t('users_col'),
            dataIndex: 'users',
            editable: false,
            render: (users) => {
                return (
                    <Space size="small">
                        <UserOutlined />
                        <span>{users}</span>
                    </Space>
                );
            },
            sorter: {
                compare: (a, b) => a.users - b.users,
                multiple: 1,
            },
        },
        {
            title: t('state_col'),
            dataIndex: 'state',
            editable: true,
            render: (text, record) => {
                const stateText = record.state;
                let stateIcon;
                let stateColor;
                switch (stateText) {
                    case 'publishing':
                    case 'published':
                        stateColor = 'success';
                        stateIcon = <CheckCircleOutlined />;
                        break;

                    case 'processing':
                    case 'processed':
                        stateColor = 'blue';
                        stateIcon = <SyncOutlined spin={stateText === 'processing' && true} />;
                        break;

                    case 'unpublishing':
                    case 'unpublished':
                        stateColor = 'warning';
                        stateIcon = <MinusCircleOutlined />;
                        break;

                    case 'deleting':
                    case 'deleted':
                        stateColor = 'error';
                        stateIcon = <DeleteOutlined />;
                        break;

                    default:
                        stateColor = 'default';
                        stateIcon = <InfoCircleOutlined />;
                }
                return (
                    <Tag icon={stateIcon} color={stateColor}>
                        {t(stateText)}
                    </Tag>
                );
            },
            filters: recordingStates.map((item) => ({
                text: t(item),
                value: item,
            })),
            onFilter: (value, record) => record.state === value,
        },
        {
            title: t('formats_col'),
            dataIndex: 'formats',
            editable: false,
            render: (text, record) => {
                return getFormatIcons(record.formats);
            },
        },
        {
            title: t('actions_col'),
            dataIndex: 'actions',
            editable: false,
            render: (text, record) => {
                const clickCancel = (record) => {
                    CompareRecords(record, editForm.getFieldsValue(true)) ? cancelEdit() : setCancelVisibility(true);
                };

                return isEditing(record) ? (
                    <Space size="middle">
                        <Popconfirm
                            title={t('cancel_edit')}
                            placement="leftTop"
                            visible={cancelVisibility}
                            onVisibleChange={() => clickCancel(record)}
                            onConfirm={cancelEdit}
                            onCancel={() => setCancelVisibility(false)}
                        >
                            <Button size="middle" className="cell-input-cancel">
                                <Trans i18nKey="cancel" />
                            </Button>
                        </Popconfirm>
                        <Button
                            size="middle"
                            type="primary"
                            className="cell-input-save"
                            onClick={() => saveEdit(record)}
                        >
                            <Trans i18nKey="save" />
                        </Button>
                    </Space>
                ) : (
                    <Space size="middle" className="table-actions">
                        {AuthService.isAllowedAction(actions, 'edit') && (
                            <Link disabled={editingKey !== null} onClick={() => toggleEdit(record)}>
                                <EditOutlined /> <Trans i18nKey="edit" />
                            </Link>
                        )}
                        {AuthService.isAllowedAction(actions, 'delete') && (
                            <Popconfirm
                                title={t('delete_recording_confirm')}
                                icon={<QuestionCircleOutlined className="red-icon" />}
                                onConfirm={() => handleDelete(record.key)}
                            >
                                <Link>
                                    <DeleteOutlined /> <Trans i18nKey="delete" />
                                </Link>
                            </Popconfirm>
                        )}
                        {AuthService.isAllowedAction(actions, 'share') && (
                            <Tooltip
                                placement={LocaleService.direction == 'rtl' ? 'right' : 'left'}
                                title={getFormatIcons(record.formats, true)}
                            >
                                <Link onClick={() => showModal(record.formats, record.url)}>
                                    <ShareAltOutlined />
                                </Link>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
    ];
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: RecordingType) => ({
                record,
                editing: isEditing(record),
                inputType: col.dataIndex === 'state' ? 'select' : 'text',

                dataIndex: col.dataIndex,
                title: col.title,
            }),
        };
    });

    return (
        <>
            <PageHeader className="site-page-header" title={<Trans i18nKey="recordings" />} />

            {isModalVisible && (
                <Modal
                    className="share-modal"
                    centered
                    open={isModalVisible}
                    onOk={handleShare}
                    onCancel={cancelShare}
                    footer={null}
                    maskClosable={false}
                >
                    <Form layout="vertical" hideRequiredMark onFinish={handleShare} validateTrigger="onSubmit">
                        <Space size={38} direction="vertical" className="modal-content">
                            <div className="mt-24">{getFormatIcons(modalFormats, true)}</div>
                            <Space size="middle" className="social-medias">
                                <div className="bbbeasy-white-btn">
                                    <FacebookShareButton url={modalUrl} quote={'Join us!'}>
                                        <FacebookIcon size={75} round />
                                    </FacebookShareButton>
                                </div>
                                <div className="bbbeasy-white-btn">
                                    <TwitterShareButton url={modalUrl}>
                                        <TwitterIcon size={75} round />
                                    </TwitterShareButton>
                                </div>

                                <div className="bbbeasy-white-btn">
                                    <LinkedinShareButton
                                        url={modalUrl}
                                        title="Create LinkedIn Share button on Website Webpages"
                                    >
                                        <LinkedinIcon size={75} round />
                                    </LinkedinShareButton>
                                </div>
                            </Space>
                            <Input
                                readOnly
                                defaultValue={modalUrl}
                                suffix={<CopyTextToClipBoard textToCopy={modalUrl} />}
                            />
                            <Form.Item className="modal-submit-btn">
                                <Button
                                    type="primary"
                                    id="submit-btn"
                                    icon={<DynamicIcon type="playback-presentation" className="bbbeasy-ppt" />}
                                    onClick={() => {
                                        window.open(modalUrl);
                                    }}
                                    htmlType="submit"
                                    block
                                >
                                    <span>
                                        <Trans i18nKey="replay" />
                                    </span>
                                </Button>
                            </Form.Item>
                        </Space>
                    </Form>
                </Modal>
            )}

            <EditableTable
                EditableCell={EditableCell}
                editForm={editForm}
                mergedColumns={mergedColumns}
                dataSource={data}
                loading={loading}
                notFoundContent="no_data"
            />
        </>
    );
};

export default withTranslation()(Recordings);
