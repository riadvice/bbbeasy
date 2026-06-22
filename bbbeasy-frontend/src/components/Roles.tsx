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

import React, { useContext, useState, useEffect, useRef } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';

import { PageHeader } from '@ant-design/pro-layout';

import { Button, Row, Col, Typography, Space, Modal, Popconfirm, Card, Checkbox, Input } from 'antd';
import {
    DeleteOutlined,
    QuestionCircleOutlined,
    UserOutlined,
    EditOutlined,
    WarningOutlined,
    CloseOutlined,
    CheckOutlined,
} from '@ant-design/icons';

import Form, { FormInstance } from 'antd/lib/form';
import { CompareRecords } from '../functions/compare.function';
import { EditableTable } from './EditableTable';
import EditableTableCell from './EditableTableCell';
import Notifications from './Notifications';
import EditableTableColumnSearch from './EditableTableColumnSearch';

import { AxiosResponse } from 'axios';
import AuthService from '../services/auth.service';
import RolesService from '../services/roles.service';

import { TableColumnType } from '../types/TableColumnType';
import { RoleType } from '../types/RoleType';
import DynamicIcon from './DynamicIcon';

const { Link } = Typography;

type formType = {
    name?: string;
    permissions?: {};
};

interface EditableCellProps {
    componentName: string;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof RoleType;
    record: RoleType;
}
const EditableContext = React.createContext<FormInstance | null>(null);

let addForm: FormInstance = null;

const Roles = () => {
    const [data, setData] = React.useState<RoleType[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [actions, setActions] = React.useState<string[]>([]);
    const [expandedKeys, setExpandedKeys] = React.useState<number[]>([]);
    const [changedKeys, setChangedKeys] = React.useState<number[]>([]);
    const [allPrivileges, setAllPrivileges] = React.useState<object>({});

    const [errorsAdd, setErrorsAdd] = React.useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);

    //list
    const getPrivileges = () => {
        RolesService.list_permissions()
            .then((response) => {
                const privileges = response.data;
                if (privileges instanceof Object) {
                    setAllPrivileges(privileges);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const getRoles = () => {
        setLoading(true);
        RolesService.list_roles()
            .then((response) => {
                setData(response.data);
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
        getPrivileges();
        getRoles();

        const rolesActions = AuthService.getActionsPermissionsByGroup('roles');
        setActions(rolesActions);
    }, []);
    const transformText = (text: string): string => {
        if (text != '') {
            text = text.replace('_', ' ');
            return text[0].toUpperCase() + text.slice(1);
        }
    };
    const getPermissionsCard = (key?: React.Key) => {
        return (
            <div className="bordered-card">
                {Object.keys(allPrivileges).map((group) => {
                    const newGroup = transformText(group);
                    return (
                        <Card bordered={false} key={group} title={newGroup} type="inner">
                            <Form.Item name={group}>
                                <Checkbox.Group disabled={key == 1}>
                                    <Row gutter={[32, 16]}>
                                        {allPrivileges[group].map((action) => (
                                            <Col key={action}>
                                                <Checkbox value={action}>{action.replace('_', ' ')}</Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>
                        </Card>
                    );
                })}
            </div>
        );
    };

    //add
    const handleAdd = (values) => {
        const formValues: formType = values;
        setErrorsAdd([]);
        const name: string = formValues.name;
        delete formValues.name;
        RolesService.add_role({ name: name, permissions: formValues })
            .then((response) => {
                setLoading(true);
                setIsModalVisible(false);
                const newRowData: RoleType = response.data.role;
                Notifications.openNotificationWithIcon('success', t('add_role_success'));
                //add data to table
                setLoading(false);
                setData([...data, newRowData]);
            })
            .catch((error) => {
                const responseData = error.response.data;
                if (responseData.errors) {
                    setErrorsAdd(responseData.errors);
                }
            });
    };
    const failedAdd = () => {
        setErrorsAdd([]);
    };
    const cancelAdd = () => {
        setIsModalVisible(false);
    };
    const toggleAdd = () => {
        addForm?.resetFields();
        setErrorsAdd([]);
        setIsModalVisible(true);
    };

    //edit permissions
    const editRow = (response: AxiosResponse, key: React.Key) => {
        Notifications.openNotificationWithIcon('success', t('edit_role_success'));
        const newRowData: RoleType = response.data.role;
        const newData = [...data];
        const index = newData.findIndex((item) => key === item.key);
        if (index > -1 && newRowData != undefined) {
            const item = newData[index];
            newData.splice(index, 1, {
                ...item,
                ...newRowData,
            });
            setData(newData);
        }
    };
    const toggleEdit = (key: number) => {
        let keys = [...expandedKeys];
        if (keys.includes(key)) {
            keys = keys.filter((item) => item !== key);
        } else {
            keys.push(key);
        }
        setExpandedKeys(keys);
    };
    const expandedRowRender = (record: RoleType) => {
        let editRowForm = null;
        const permissionsChecked = record.permissions;

        const compareActions = (oldRecord: object, newRecord: object, groups: string[]): boolean => {
            let condition = true;
            for (const group of groups) {
                const oldActions = oldRecord[group];
                const newActions = newRecord[group];
                if (oldActions.length != newActions.length) {
                    condition = false;
                    break;
                } else {
                    const resultActions: boolean = oldActions.every(function (element) {
                        return newActions.indexOf(element) !== -1;
                    });
                    if (!resultActions) {
                        condition = false;
                        break;
                    }
                }
            }
            return condition;
        };
        const compareGroups = (
            oldRecord: object,
            newRecord: object,
            oldGroups: string[],
            newGroups: string[]
        ): boolean => {
            const resultGroup = oldGroups.every(function (element) {
                return newGroups.indexOf(element) !== -1;
            });
            if (!resultGroup) return false;
            return compareActions(oldRecord, newRecord, oldGroups);
        };
        const compareEditData = (oldRecord: object, newRecord: object): boolean => {
            const oldGroups = Object.keys(oldRecord);
            const newGroups = Object.keys(newRecord);
            if (oldGroups.length != newGroups.length) return false;
            return compareGroups(oldRecord, newRecord, oldGroups, newGroups);
        };
        const cancelEdit = (key: React.Key) => {
            editRowForm?.resetFields();
            setExpandedKeys(expandedKeys.filter((item) => item !== key));
            setChangedKeys(changedKeys.filter((item) => item !== key));
        };
        const saveRole = (formValues: object, key: number) => {
            RolesService.edit_role({ permissions: formValues }, key)
                .then((response) => {
                    editRow(response, key);
                    setExpandedKeys(expandedKeys.filter((item) => item !== key));
                    setChangedKeys(changedKeys.filter((item) => item !== key));
                })
                .catch((error) => {
                    console.log(error);
                });
        };
        const saveEdit = (key: number) => {
            const oldData = record.permissions;
            const newData = editRowForm.getFieldsValue(true);
            if (!compareEditData(oldData, newData)) {
                saveRole(newData, key);
            } else {
                Notifications.openNotificationWithIcon('info', t('no_changes'));
                cancelEdit(key);
            }
        };
        const changeEdit = (key: number) => {
            const keys = [...changedKeys];
            if (!keys.includes(key)) {
                keys.push(key);
                setChangedKeys(keys);
            }
        };

        return (
            <fieldset disabled={!AuthService.isAllowedAction(actions, 'edit')}>
                <Form
                    ref={(form) => (editRowForm = form)}
                    initialValues={permissionsChecked}
                    onFinish={() => saveEdit(record.key)}
                    onChange={() => changeEdit(record.key)}
                >
                    <Card bordered={false} className="card-parent">
                        {getPermissionsCard(record.key)}
                        {AuthService.isAllowedAction(actions, 'edit') && record.key != 1 && (
                            <Space size="middle" className="actions-expanded">
                                {changedKeys.includes(record.key) ? (
                                    <Popconfirm
                                        title={t('cancel_edit')}
                                        placement="leftTop"
                                        onConfirm={() => cancelEdit(record.key)}
                                    >
                                        <Button size="middle" className="cell-input-cancel">
                                            <Trans i18nKey="cancel" />
                                        </Button>
                                    </Popconfirm>
                                ) : (
                                    <Button
                                        size="middle"
                                        className="cell-input-cancel"
                                        onClick={() => cancelEdit(record.key)}
                                    >
                                        <Trans i18nKey="cancel" />
                                    </Button>
                                )}
                                <Button size="middle" type="primary" htmlType="submit">
                                    <Trans i18nKey="save" />
                                </Button>
                            </Space>
                        )}
                    </Card>
                </Form>
            </fieldset>
        );
    };

    // edit name
    const [editTableForm] = Form.useForm();
    const EditableCell: React.FC<EditableCellProps> = ({ editable, children, dataIndex, record, ...restProps }) => {
        const [isShown, setIsShown] = useState<boolean>(false);
        const [editing, setEditing] = useState<boolean>(false);
        const inputRef = useRef(null);
        const [errorsEdit, setErrorsEdit] = React.useState({});
        const editForm = useContext(EditableContext);
        useEffect(() => {
            if (editing) {
                inputRef.current.focus();
            }
        }, [editing]);
        const toggleEditName = () => {
            setEditing(!editing);
            let nameText = record[dataIndex] as string;
            if (dataIndex == 'name') {
                nameText = transformText(nameText);
            }
            editForm.setFieldsValue({ [dataIndex]: nameText });
        };
        const cancelName = () => {
            setErrorsEdit({});
            setEditing(!editing);
        };
        const saveName = async () => {
            setErrorsEdit({});
            try {
                const values = (await editForm.validateFields()) as RoleType;
                const key = record.key;
                RolesService.edit_role(values, key)
                    .then((response) => {
                        toggleEditName();
                        editRow(response, key);
                    })
                    .catch((error) => {
                        const responseData = error.response.data;
                        if (responseData.errors) {
                            const err = responseData.errors;
                            err['key'] = key;
                            setErrorsEdit(err);
                        }
                    });
            } catch (errInfo) {
                console.log('Save failed:', errInfo);
            }
        };
        const keepName = () => {
            Notifications.openNotificationWithIcon('info', t('no_changes'));
            cancelName();
        };
        const compareName = () => {
            return !CompareRecords(transformText(record.name), editForm.getFieldsValue(true).name)
                ? saveName()
                : keepName();
        };

        return (
            <EditableTableCell
                componentName="Roles"
                editing={editing}
                dataIndex={dataIndex}
                record={record}
                inputNode={
                    <Input
                        ref={inputRef}
                        onPressEnter={compareName}
                        suffix={
                            <>
                                <Button
                                    icon={<CloseOutlined />}
                                    size="small"
                                    onClick={cancelName}
                                    className="cell-input-cancel"
                                />
                                <Button
                                    icon={<CheckOutlined />}
                                    size="small"
                                    onClick={compareName}
                                    type="primary"
                                    className="cell-input-save"
                                />
                            </>
                        }
                    />
                }
                errorsEdit={errorsEdit}
                editable={editable}
                editComponent={
                    isShown &&
                    AuthService.isAllowedAction(actions, 'edit') && (
                        <Button
                            size="small"
                            type="link"
                            icon={<EditOutlined className="cell-edit-icon" />}
                            onClick={toggleEditName}
                        />
                    )
                }
                {...restProps}
                mouseOverFct={() => setIsShown(true)}
                mouseLeaveFct={() => setIsShown(false)}
            >
                {children}
            </EditableTableCell>
        );
    };

    // delete
    const deleteRole = (key: number, nbUsers: number) => {
        RolesService.delete_role(key)
            .then((response) => {
                setLoading(true);
                const newData = [...data];
                if (nbUsers > 0 && response.data.lecturer) {
                    const LecturerRowData: RoleType = response.data.lecturer;
                    const index = newData.findIndex((item) => item.key === 2);
                    if (index > -1 && LecturerRowData != undefined) {
                        const item = newData[index];
                        // update lecturer row to get switched users
                        newData.splice(index, 1, {
                            ...item,
                            ...LecturerRowData,
                        });
                    }
                }
                // delete item of this page
                setData(newData.filter((item) => item.key !== key));
                setLoading(false);
                Notifications.openNotificationWithIcon('success', t('delete_role_success'));
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const handleDelete = (key: number, nbUsers: number) => {
        if (nbUsers > 0) {
            Modal.confirm({
                wrapClassName: 'delete-wrap',
                title: null,
                icon: null,
                content: (
                    <>
                        <WarningOutlined className="delete-icon" />
                        <span className="ant-modal-confirm-title">
                            <Trans i18nKey="delete_role_title" />
                        </span>
                        <Trans i18nKey="delete_role_content" />
                    </>
                ),
                okType: 'danger',
                okText: <Trans i18nKey="confirm_yes" />,
                cancelText: <Trans i18nKey="confirm_no" />,
                onOk: () => deleteRole(key, nbUsers),
            });
        } else {
            deleteRole(key, nbUsers);
        }
    };

    const columns: TableColumnType[] = [
        {
            title: t('name_col'),
            dataIndex: 'name',
            editable: true,
            width: '35%',
            ...EditableTableColumnSearch('name'),
            sorter: {
                compare: (a, b) => a.name.localeCompare(b.name),
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
            title: t('actions_col'),
            dataIndex: 'actions',
            editable: false,
            render: (text, record) => {
                return (
                    <Space
                        size="middle"
                        className={expandedKeys.includes(record.key) ? 'table-actions editable' : 'table-actions'}
                    >
                        <Link onClick={() => toggleEdit(record.key)}>
                            <DynamicIcon type="permissions" className="icon-bbbeasy-permissions" />{' '}
                            <Trans i18nKey="permissions.label" />
                        </Link>
                        {AuthService.isAllowedAction(actions, 'delete') && record.key != 1 && record.key != 2 && (
                            <Popconfirm
                                title={t('delete_role_confirm')}
                                icon={<QuestionCircleOutlined className="red-icon" />}
                                onConfirm={() => handleDelete(record.key, record.users)}
                            >
                                <Link>
                                    <DeleteOutlined /> <Trans i18nKey="delete" />
                                </Link>
                            </Popconfirm>
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
            onCell: (record: RoleType) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
            }),
        };
    });

    return (
        <>
            <PageHeader
                title={<Trans i18nKey="roles" />}
                extra={
                    AuthService.isAllowedAction(actions, 'add') && [
                        <Button key="1" type="primary" id="add-role-btn" onClick={toggleAdd}>
                            <Trans i18nKey="new_role" />
                        </Button>,
                    ]
                }
            />

            {AuthService.isAllowedAction(actions, 'add') && (
                <Modal
                    title={<Trans i18nKey="new_role" />}
                    className="add-modal medium-modal"
                    centered
                    open={isModalVisible}
                    onOk={handleAdd}
                    onCancel={cancelAdd}
                    footer={null}
                    width={600}
                    maskClosable={true}
                >
                    <Form
                        layout="vertical"
                        name="roles_form"
                        ref={(form) => (addForm = form)}
                        initialValues={{ name: '' }}
                        hideRequiredMark
                        onFinish={handleAdd}
                        onFinishFailed={failedAdd}
                        validateTrigger="onSubmit"
                    >
                        <Form.Item
                            label={<Trans i18nKey="name.label" />}
                            name="name"
                            {...('name' in errorsAdd && {
                                help: (
                                    <Trans
                                        i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsAdd['name'])}
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
                            <Input placeholder={t('name.label')} />
                        </Form.Item>
                        <div className="ant-col ant-form-item-label">
                            <label>
                                <Trans i18nKey="permissions.label" />
                            </label>
                        </div>
                        <div className="card-parent">{getPermissionsCard()}</div>
                        <Form.Item className="button-container">
                            <Button type="text" className="cancel-btn prev" block onClick={cancelAdd}>
                                <Trans i18nKey="cancel" />
                            </Button>
                            <Button type="primary" htmlType="submit" block>
                                <Trans i18nKey="create" />
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            )}

            <EditableTable
                EditableCell={EditableCell}
                editForm={editTableForm}
                EditableContext={EditableContext}
                mergedColumns={mergedColumns}
                dataSource={data}
                loading={loading}
                expandableTable={{
                    expandedRowRender: expandedRowRender,
                    showExpandColumn: false,
                    expandedRowKeys: expandedKeys,
                }}
                notFoundContent="no_data"
            />
        </>
    );
};

export default withTranslation()(Roles);
