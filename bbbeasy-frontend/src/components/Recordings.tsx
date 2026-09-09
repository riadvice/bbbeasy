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

import PageHeader from './PageHeader';

import { Button, Form, Input, Popconfirm, Select, Space, Tag, Tooltip, Typography } from 'antd';
import {
    DeleteOutlined,
    QuestionCircleOutlined,
    UserOutlined,
    EditOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    InfoCircleOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons';

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

import ModalSocialLinks from './ModalSocialLinks';
import RecordingFormatIcons from './RecordingFormatIcons';

const { Link } = Typography;
const { Option } = Select;

interface EditableCellProps {
    componentName: string;
    editing: boolean;
    children: React.ReactNode;
    dataIndex: keyof RecordingType;
    record: RecordingType;
    inputType: 'text' | 'select';
    inputNode: React.JSX.Element;
    errorsEdit: object;
}

/**
 * Declared here rather than inside Recordings: a component defined during a render is a
 * new type on every render, so React unmounts the cell and the field being edited loses
 * its focus and its caret. Everything it needs arrives through the column onCell.
 */
const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    children,
    dataIndex,
    record,
    inputNode,
    errorsEdit,
    ...restProps
}) => (
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

const Recordings = () => {
    const [data, setData] = React.useState<RecordingType[]>([]);
    const [recordingStates, setRecordingStates] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [actions, setActions] = React.useState<string[]>([]);

    const [editingKey, setEditingKey] = React.useState<string>(null);
    const [errorsEdit, setErrorsEdit] = React.useState({});
    const [cancelVisibility, setCancelVisibility] = React.useState<boolean>(false);

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
    const getInputNode = (dataIndex: string): React.JSX.Element => {
        if (dataIndex === 'state') {
            const statesOptions = recordingStates.map((item) => (
                <Option key={item} value={item} className="text-capitalize">
                    {t(item)}
                </Option>
            ));

            return getSelectItems(t('state.placeholder'), statesOptions);
        }

        return <Input onFocus={() => setCancelVisibility(false)} />;
    };

    const toggleEdit = (record: RecordingType) => {
        setCancelVisibility(false);
        setEditingKey(record.key);
        editForm.setFieldsValue(record);
    };
    const isEditing = (record: RecordingType) => record.key === editingKey;
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
                            if (index > -1 && newRowData != null) {
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
                return <RecordingFormatIcons formats={record.formats} />;
            },
        },
        {
            title: t('actions_col'),
            dataIndex: 'actions',
            editable: false,
            render: (text, record) => {
                const clickCancel = (record) => {
                    if (CompareRecords(record, editForm.getFieldsValue(true))) {
                        cancelEdit();
                    } else {
                        setCancelVisibility(true);
                    }
                };

                return isEditing(record) ? (
                    <Space size="middle">
                        <Popconfirm
                            title={t('cancel_edit')}
                            placement="leftTop"
                            open={cancelVisibility}
                            onOpenChange={() => clickCancel(record)}
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
                                <Link className="delete-button-color">
                                    <DeleteOutlined /> <Trans i18nKey="delete" />
                                </Link>
                            </Popconfirm>
                        )}
                        {AuthService.isAllowedAction(actions, 'share') && (
                            <Tooltip
                                placement={LocaleService.direction === 'rtl' ? 'right' : 'left'}
                                title={<RecordingFormatIcons formats={record.formats} showDisabled />}
                            >
                                <ModalSocialLinks recording={record} />
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
                errorsEdit,
                inputNode: getInputNode(col.dataIndex),
            }),
        };
    });

    return (
        <>
            <PageHeader className="site-page-header recordings-page-header" title={<Trans i18nKey="recordings" />} />

            <div className="recordings-table">
                <EditableTable
                    EditableCell={EditableCell}
                    editForm={editForm}
                    mergedColumns={mergedColumns}
                    dataSource={data}
                    loading={loading}
                    notFoundContent="no_recordings"
                />
            </div>
        </>
    );
};

export default withTranslation()(Recordings);
