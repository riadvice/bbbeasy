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

import { Badge, Button, Form, Input, Modal, Popconfirm, Space, Typography, ColorPicker, theme, Alert } from 'antd';
import { DeleteOutlined, EditOutlined, QuestionCircleOutlined, WarningOutlined } from '@ant-design/icons';

import Notifications from './Notifications';
import AddLabelForm from './AddLabelForm';

import { DataContext } from 'lib/RoomsContext';
import { CompareRecords } from '../functions/compare.function';
import { EditableTable } from './EditableTable';
import EditableTableCell from './EditableTableCell';
import EditableTableColumnSearch from './EditableTableColumnSearch';
import type { Color } from 'antd/es/color-picker';
import AuthService from '../services/auth.service';
import LabelsService from '../services/labels.service';

import { TableColumnType } from '../types/TableColumnType';
import { LabelType } from '../types/LabelType';
import EN_US from '../locale/en-US.json';
import { isEmpty } from 'lodash';
const { Link } = Typography;

interface EditableCellProps {
    componentName: string;
    editing: boolean;
    children: React.ReactNode;
    dataIndex: keyof LabelType;
    record: LabelType;
    inputType: 'text';
}

const Labels = () => {
    const dataContext = React.useContext(DataContext);
    const [data, setData] = React.useState<LabelType[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [actions, setActions] = React.useState<string[]>([]);
    const [editingKey, setEditingKey] = React.useState<number>(null);
    const [errorsEdit, setErrorsEdit] = React.useState({});
    const [cancelVisibility, setCancelVisibility] = React.useState<boolean>(false);
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [color, setColor] = React.useState<string>('');
    const [isErrorValidation, setIsErrorValidation] = React.useState<boolean>(false);
    const [errorMsg, setErrorMsg] = React.useState<string>('');
    const { token } = theme.useToken();
    const getLabels = () => {
        setLoading(true);
        LabelsService.list_labels()
            .then((response) => {
                if (response.data) {
                    setData(response.data);
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        //Runs only on the first render
        getLabels();

        const labelsActions = AuthService.getActionsPermissionsByGroup('labels');
        setActions(labelsActions);
    }, []);

    //delete
    const deleteLabel = (key: number) => {
        setLoading(true);
        LabelsService.delete_label(key)
            .then(() => {
                Notifications.openNotificationWithIcon('success', t('delete_label_success'));
                setData((labels) => labels.filter((label) => label.key !== key));
                const indexLabel = dataContext.dataLabels.findIndex((item) => key === item.key);
                if (indexLabel !== -1) {
                    dataContext.dataLabels.splice(indexLabel, 1);
                }
                dataContext.dataRooms.map((r) => {
                    const index = r.labels.findIndex((item) => key === item.key);

                    if (index !== -1) {
                        r.labels.splice(index, 1);
                    }
                });
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };
    const handleDelete = (key: number, nbRooms: number) => {
        if (nbRooms > 0) {
            Modal.confirm({
                wrapClassName: 'delete-wrap',
                title: null,
                icon: null,
                content: (
                    <>
                        <WarningOutlined className="delete-icon" />
                        <span className="ant-modal-confirm-title">
                            <Trans i18nKey="delete_label_title" />
                        </span>
                        <Trans i18nKey="delete_label_content" />
                    </>
                ),
                okType: 'danger',
                okText: <Trans i18nKey="confirm_yes" />,
                cancelText: <Trans i18nKey="confirm_no" />,
                onOk: () => deleteLabel(key),
            });
        } else {
            deleteLabel(key);
        }
    };

    //edit
    const [editForm] = Form.useForm();
    const EditableCell: React.FC<EditableCellProps> = ({ editing, children, dataIndex, record, ...restProps }) => {
        return (
            <EditableTableCell
                componentName="Labels"
                editing={editing}
                dataIndex={dataIndex}
                record={record}
                inputNode={
                    <Input
                        onFocus={() => {
                            setCancelVisibility(false);
                        }}
                        style={{
                            borderColor: dataIndex == 'name' && isErrorValidation ? 'red' : null,
                        }}
                    />
                }
                errorsEdit={errorsEdit}
                showLabelColor={dataIndex == 'description'}
                inputColor={
                    record && (
                        <>
                            <ColorPicker
                                onChange={(color1: Color) => {
                                    editForm.setFieldValue('color', color1.toHexString());
                                    (document.getElementById('newColor') as HTMLInputElement).value =
                                        editForm.getFieldValue('color');
                                    (document.getElementById('myNewColor') as HTMLInputElement).style.backgroundColor =
                                        editForm.getFieldValue('color');
                                }}
                            >
                                <Space className="space-color-picker">
                                    <div
                                        id="myNewColor"
                                        style={{
                                            width: token.sizeMD,
                                            height: token.sizeMD,
                                            borderRadius: token.borderRadiusSM,
                                            backgroundColor: record.color,
                                        }}
                                    />
                                    <span>
                                        <input
                                            className="code-color-picker-edit-label"
                                            disabled
                                            type="text"
                                            id="newColor"
                                            value={editForm.getFieldValue('color')}
                                        />
                                    </span>
                                </Space>
                            </ColorPicker>
                        </>
                    )
                }
                {...restProps}
            >
                {dataIndex == 'name' && record != null ? (
                    <Badge
                        count={record.name}
                        style={{
                            backgroundColor: record.color,
                        }}
                    />
                ) : (
                    children
                )}
            </EditableTableCell>
        );
    };
    const isEditing = (record: LabelType) => record.key == editingKey;
    const toggleEdit = (record: LabelType) => {
        setCancelVisibility(false);
        setEditingKey(record.key);
        setErrorsEdit({});
        const recordClone = { ...record };
        editForm.setFieldsValue(recordClone);
    };
    const cancelEdit = () => {
        setCancelVisibility(false);
        setEditingKey(null);
    };
    const saveEdit = async (record: LabelType, key: number) => {
        try {
            const formValues: object = await editForm.validateFields();

            if (!CompareRecords(record, editForm.getFieldsValue(true))) {
                setIsErrorValidation(false);
                setLoading(true);
                setErrorsEdit({});
                LabelsService.edit_label(formValues, key)
                    .then((response) => {
                        const newRow: LabelType = response.data.label;
                        const index = data.findIndex((item) => key === item.key);
                        if (index !== -1 && newRow) {
                            setData((data) => {
                                data[index] = newRow;
                                dataContext.dataLabels[index] = newRow;

                                return [...data];
                            });
                            dataContext.dataRooms.map((r) => {
                                const index = r.labels.findIndex((item) => key === item.key);
                                r.labels[index] = newRow;
                            });
                            cancelEdit();
                        }
                        Notifications.openNotificationWithIcon('success', t('edit_label_success'));
                    })
                    .catch((error) => {
                        const responseData = error.response.data;
                        if (responseData.errors) {
                            const err = responseData.errors;
                            err['key'] = key;
                            setErrorsEdit(err);
                        }
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            } else {
                Notifications.openNotificationWithIcon('info', t('no_changes'));
                setIsErrorValidation(false);
                cancelEdit();
            }
        } catch (errInfo) {
            console.error('Save failed:', errInfo);
        }
    };
    const dataValidation = (record: LabelType, key: number) => {
        const newLabel = editForm.getFieldsValue(true);
        if (isEmpty(newLabel.name)) {
            setIsErrorValidation(true);
            setErrorMsg('name.required');
            return;
        }
        if (newLabel.name.length > 32) {
            setIsErrorValidation(true);
            setErrorMsg('label_name.maxSize');
            return;
        }
        saveEdit(record, key);
    };
    const columns: TableColumnType[] = [
        {
            title: t('name_col'),
            dataIndex: 'name',
            inputType: 'text',
            editable: true,
            ...EditableTableColumnSearch('name'),
            width: '20%',
            sorter: {
                compare: (a, b) => a.name.localeCompare(b.name),
                multiple: 3,
            },
        },
        {
            title: t('description_col'),
            dataIndex: 'description',
            inputType: 'text',
            editable: true,
            ...EditableTableColumnSearch('description'),
            width: '40%',
            sorter: {
                compare: (a, b) => a.description.localeCompare(b.description),
                multiple: 2,
            },
        },
        {
            title: t('nb_rooms_col'),
            dataIndex: 'nb_rooms',
            inputType: 'text',
            editable: false,
            ...EditableTableColumnSearch('nb_rooms'),
            width: '15%',
            sorter: {
                compare: (a, b) => a.nb_rooms - b.nb_rooms,
                multiple: 1,
            },
        },
    ];
    if (AuthService.isAllowedAction(actions, 'edit') || AuthService.isAllowedAction(actions, 'delete')) {
        columns.push({
            title: t('actions_col'),
            dataIndex: 'actions',
            editable: false,
            render: (text, record) => {
                const handleCancelVisibilityChange = () => {
                    CompareRecords(record, editForm.getFieldsValue(true)) ? cancelEdit() : null;
                };

                const EditActions = (
                    <Space size="middle">
                        <Popconfirm
                            title={t('cancel_edit')}
                            placement="leftTop"
                            visible={cancelVisibility}
                            onConfirm={() => cancelEdit()}
                            onCancel={() => setCancelVisibility(false)}
                            onVisibleChange={handleCancelVisibilityChange}
                        >
                            <Button size="middle" className="cell-input-cancel">
                                <Trans i18nKey="cancel" />
                            </Button>
                        </Popconfirm>
                        <Button
                            disabled={loading}
                            size="middle"
                            type="primary"
                            onClick={() => dataValidation(record, record.key)}
                        >
                            <Trans i18nKey="save" />
                        </Button>
                    </Space>
                );
                const Actions = (
                    <Space size="middle">
                        {AuthService.isAllowedAction(actions, 'edit') && (
                            <Link
                                className="edit-button-color"
                                disabled={editingKey !== null}
                                onClick={() => toggleEdit(record)}
                            >
                                <EditOutlined /> <Trans i18nKey="edit" />
                            </Link>
                        )}
                        {AuthService.isAllowedAction(actions, 'delete') && (
                            <Popconfirm
                                title={t('delete_label_confirm')}
                                icon={<QuestionCircleOutlined className="red-icon" />}
                                onConfirm={() => handleDelete(record.key, record.nb_rooms)}
                            >
                                <Link className="delete-button-color">
                                    <DeleteOutlined /> <Trans i18nKey="delete" />
                                </Link>
                            </Popconfirm>
                        )}
                    </Space>
                );

                const editable = isEditing(record);
                return editable ? EditActions : Actions;
            },
        });
    }

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: LabelType) => ({
                record,
                inputType: 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <>
            <PageHeader
                title={<Trans i18nKey="labels" />}
                extra={
                    AuthService.isAllowedAction(actions, 'add') && [
                        <Button key="1" type="primary" onClick={() => setIsModalVisible(true)}>
                            <Trans i18nKey="new_label" />
                        </Button>,
                    ]
                }
            />

            {AuthService.isAllowedAction(actions, 'add') && (
                <AddLabelForm
                    defaultColor="#fbbc0b"
                    isModalShow={isModalVisible}
                    close={() => {
                        setIsModalVisible(false);
                    }}
                />
            )}
            {isErrorValidation ? (
                <div className="error-message-Label">
                    <Alert type="error" message={<Trans i18nKey={errorMsg} />} showIcon />
                </div>
            ) : null}
            <EditableTable
                EditableCell={EditableCell}
                editForm={editForm}
                mergedColumns={mergedColumns}
                dataSource={data}
                loading={loading}
                notFoundContent="no_labels"
            />
        </>
    );
};

export default withTranslation()(Labels);
