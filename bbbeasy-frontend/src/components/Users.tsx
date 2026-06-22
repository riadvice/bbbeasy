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
import EN_US from '../locale/en-US.json';
import { t } from 'i18next';

import { PageHeader } from '@ant-design/pro-layout';
import { Alert, Button, Form, Input, Modal, Popconfirm, Select, Space, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, QuestionCircleOutlined, StarFilled } from '@ant-design/icons';

import { FormInstance } from 'antd/lib/form';
import { CompareRecords } from '../functions/compare.function';
import { EditableTable } from './EditableTable';
import EditableTableCell from './EditableTableCell';
import Notifications from './Notifications';
import AddUserForm from './AddUserForm';
import EditableTableColumnSearch from './EditableTableColumnSearch';

import AuthService from '../services/auth.service';
import UsersService from '../services/users.service';
import RolesService from '../services/roles.service';

import { TableColumnType } from '../types/TableColumnType';
import { UserType } from '../types/UserType';
import { RoleType } from '../types/RoleType';
import settingsService from '../services/settings.service';

const { Option } = Select;
const { Link } = Typography;

type formType = {
    username?: string;
    email?: string;
    password?: string;
    role?: number;
    status?: number;
};

interface EditableCellProps {
    componentName: string;
    editing: boolean;
    children: React.ReactNode;
    dataIndex: keyof UserType;
    record: UserType;
    inputType: 'text' | 'select';
}
let addForm: FormInstance = null;

const Users = () => {
    const [data, setData] = React.useState<UserType[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [actions, setActions] = React.useState<string[]>([]);
    const [colletRolesAction, setCollectRolesAction] = React.useState<boolean>(false);
    const [allStates, setAllStates] = React.useState<string[]>([]);
    const [allRoles, setAllRoles] = React.useState<RoleType[]>([]);
    const [editingKey, setEditingKey] = React.useState<number>(null);
    const [cancelVisibility, setCancelVisibility] = React.useState<boolean>(false);
    const [errorsAdd, setErrorsAdd] = React.useState<string>('');
    const [errorsEdit, setErrorsEdit] = React.useState({});
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [brandColor, setBrandColor] = React.useState<string>('');

    const getBrandColor = () => {
        settingsService.collect_settings().then((response) => {
            setBrandColor(response.data.brand_color);
        });
    };

    //list
    const getRoles = () => {
        RolesService.collect_roles()
            .then((response) => {
                const roles = response.data;
                if (roles.length > 0) {
                    setAllRoles(roles);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const getUsers = () => {
        setLoading(true);
        UsersService.list_users()
            .then((response) => {
                if (response.data.users) {
                    setData(response.data.users);
                }
                if (response.data.states) {
                    const states: string[] = response.data.states;
                    setAllStates(states);
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
        const rolesActions = AuthService.getActionsPermissionsByGroup('roles');
        const isCollect = AuthService.isAllowedAction(rolesActions, 'collect');
        setCollectRolesAction(isCollect);

        if (isCollect) {
            getRoles();
        }
        getUsers();
        getBrandColor();

        const usersActions = AuthService.getActionsPermissionsByGroup('users');
        setActions(usersActions);
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
    const getSelectRoles = () => {
        const rolesOptions = allRoles.map((item) => (
            <Option key={item.id} value={item.id} className="text-capitalize">
                {item.name}
            </Option>
        ));
        return getSelectItems(t('role.placeholder'), rolesOptions);
    };

    // add
    const initialAddValues: formType = {
        username: '',
        email: '',
        password: '',
    };
    const handleAdd = (values) => {
        const formValues: formType = values;
        setErrorsAdd('');

        UsersService.add_user(formValues)
            .then((response) => {
                setLoading(true);
                setIsModalVisible(false);
                const newRowData: UserType = response.data.user;

                Notifications.openNotificationWithIcon('success', t('add_user_success'));
                //delete data of form
                addForm?.resetFields();
                //add data to table
                setLoading(false);
                setData([...data, newRowData]);
            })
            .catch((error) => {
                const responseData = error.response.data;
                if (responseData.message) {
                    setErrorsAdd(responseData.message);
                }
            });
    };
    const cancelAdd = () => {
        setIsModalVisible(false);
    };
    const toggleAdd = () => {
        addForm?.resetFields();
        setErrorsAdd('');
        setIsModalVisible(true);
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
            const statesOptions = allStates.map((item, index) => (
                <Option key={index} value={item} className="text-capitalize">
                    {t(item)}
                </Option>
            ));

            inputNode = dataIndex == 'role' ? getSelectRoles() : getSelectItems(t('status.placeholder'), statesOptions);
        } else {
            inputNode = <Input onFocus={() => setCancelVisibility(false)} />;
        }
        return (
            <EditableTableCell
                componentName="Users"
                editing={editing}
                dataIndex={dataIndex}
                record={record}
                inputNode={inputNode}
                errorsEdit={errorsEdit}
                editRules={
                    (dataIndex == 'username' && {
                        min: 4,
                        message: t('invalid_username'),
                    }) ||
                    (dataIndex == 'email' && {
                        type: 'email',
                        message: t('invalid_email'),
                    }) ||
                    (dataIndex == 'role' && {
                        validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error())),
                    })
                }
                {...restProps}
            >
                {children}
            </EditableTableCell>
        );
    };
    const isEditing = (record: UserType) => record.key == editingKey;
    const changeRoleCol = (record: UserType): object => {
        if (typeof record.role == 'string') {
            const res = allRoles.filter((role) => role.name == record.role);
            record.role = res[0].id;
        }
        return record;
    };
    const toggleEdit = (record: UserType) => {
        setCancelVisibility(false);
        setEditingKey(record.key);
        let newRecord: object = { ...record };
        newRecord = changeRoleCol(newRecord as UserType);
        editForm.setFieldsValue(newRecord);
    };
    const cancelEdit = () => {
        setCancelVisibility(false);
        setEditingKey(null);
    };
    const compareEdit = (oldRecord: UserType, newRecord: object): boolean => {
        let oldEdit: object = { ...oldRecord };
        oldEdit = changeRoleCol(oldEdit as UserType);
        return CompareRecords(oldEdit, newRecord);
    };
    const saveEdit = async (record: UserType, key: number) => {
        try {
            const formValues: object = await editForm.validateFields();
            setErrorsEdit({});
            if (!compareEdit(record, editForm.getFieldsValue(true))) {
                UsersService.edit_user(formValues, key)
                    .then((response) => {
                        const newRowData: UserType = response.data.user;
                        const newData = [...data];
                        const index = newData.findIndex((item) => key === item.key);
                        if (index > -1 && newRowData != undefined) {
                            const item = newData[index];
                            newData.splice(index, 1, {
                                ...item,
                                ...newRowData,
                            });
                            setData(newData);
                            cancelEdit();
                        }
                        Notifications.openNotificationWithIcon('success', t('edit_user_success'));
                    })
                    .catch((error) => {
                        const responseData = error.response.data;
                        if (responseData.errors) {
                            const err = responseData.errors;
                            err['key'] = key;
                            setErrorsEdit(err);
                        }
                    });
            } else {
                Notifications.openNotificationWithIcon('info', t('no_changes'));
                cancelEdit();
            }
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
            const errors = errInfo.errorFields;
            const err = {};
            errors.map((error) => {
                const errorKey = error['name'][0];
                err[errorKey] = error['errors'][0];
            });
            console.log(err);
        }
    };

    // delete
    const handleDelete = (key: number) => {
        UsersService.delete_user(key)
            .then((response) => {
                setLoading(true);
                const newData = [...data];
                // update item
                const newRowData: UserType = response.data.user;
                const index = newData.findIndex((item) => key === item.key);
                if (index > -1 && newRowData != undefined) {
                    const item = newData[index];
                    newData.splice(index, 1, {
                        ...item,
                        ...newRowData,
                    });
                    setLoading(false);
                    setData(newData);
                }
                Notifications.openNotificationWithIcon('success', t('delete_user_success'));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const columns: TableColumnType[] = [
        {
            title: t('username_col'),
            dataIndex: 'username',
            editable: true,
            ...EditableTableColumnSearch('username'),
            width: '20%',
            sorter: {
                compare: (a, b) => a.username.localeCompare(b.username),
                multiple: 4,
            },
            render: (username, record) => {
                if (record.key == 1) {
                    return (
                        <>
                            {' '}
                            <StarFilled style={{ color: brandColor }} /> {username}{' '}
                        </>
                    );
                } else {
                    return <>{username}</>;
                }
            },
        },
        {
            title: t('email_col'),
            dataIndex: 'email',
            editable: true,
            ...EditableTableColumnSearch('email'),
            width: '30%',
            sorter: {
                compare: (a, b) => a.email.localeCompare(b.email),
                multiple: 3,
            },
        },
        {
            title: t('role_col'),
            dataIndex: 'role',
            editable: true,
            ...EditableTableColumnSearch('role'),
            width: '15%',
            sorter: {
                compare: (a, b) => a.role.localeCompare(b.role),
                multiple: 2,
            },
        },
        {
            title: t('status_col'),
            dataIndex: 'status',
            editable: true,
            width: '15%',
            render: (status) => {
                let color;
                switch (status) {
                    case 'active':
                        color = 'success';
                        break;
                    case 'inactive':
                        color = 'default';
                        break;
                    case 'pending':
                        color = 'warning';
                        break;
                    case 'deleted':
                        color = 'error';
                        break;
                    default:
                        color = '';
                }
                return <Tag color={color}>{t(status)}</Tag>;
            },
            filters: allStates.map((item) => ({
                text: t(item),
                value: item,
            })),
            onFilter: (value, record) => record.status === value,
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

    if (
        (AuthService.isAllowedAction(actions, 'edit') && colletRolesAction) ||
        AuthService.isAllowedAction(actions, 'delete')
    ) {
        columns[0].width = '15%';
        columns[1].width = '25%';
        columns[3].width = '10%';

        columns.push({
            title: t('actions_col'),
            dataIndex: 'actions',
            editable: false,
            render: (text, record) => {
                const clickCancel = (record) => {
                    const oldData = record;
                    const newData = editForm.getFieldsValue(true);
                    compareEdit(oldData, newData) ? cancelEdit() : null;
                };
                const editable = isEditing(record);
                const deletedRow = record.status == 'deleted';

                return editable ? (
                    <Space size="middle">
                        <Popconfirm
                            title={t('cancel_edit')}
                            placement="leftTop"
                            visible={cancelVisibility}
                            onVisibleChange={() => clickCancel(record)}
                            onConfirm={() => cancelEdit()}
                            onCancel={() => setCancelVisibility(false)}
                        >
                            <Button size="middle" className="cell-input-cancel">
                                <Trans i18nKey="cancel" />
                            </Button>
                        </Popconfirm>
                        <Button size="middle" type="primary" onClick={() => saveEdit(record, record.key)}>
                            <Trans i18nKey="save" />
                        </Button>
                    </Space>
                ) : (
                    <Space size="middle">
                        {AuthService.isAllowedAction(actions, 'edit') && colletRolesAction && record.key != 1 && (
                            <Link
                                className="edit-button-color"
                                disabled={editingKey !== null}
                                onClick={() => toggleEdit(record)}
                            >
                                <EditOutlined /> <Trans i18nKey="edit" />
                            </Link>
                        )}
                        {AuthService.isAllowedAction(actions, 'delete') && !deletedRow && record.key != 1 && (
                            <Popconfirm
                                title={t('delete_user_confirm')}
                                icon={<QuestionCircleOutlined className="red-icon" />}
                                onConfirm={() => handleDelete(record.key)}
                            >
                                <Link className="delete-button-color">
                                    <DeleteOutlined /> <Trans i18nKey="delete" />
                                </Link>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        });
    }

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: UserType) => ({
                record,
                inputType: col.dataIndex === 'role' || col.dataIndex === 'status' ? 'select' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <>
            <PageHeader
                title={<Trans i18nKey="users" />}
                extra={
                    AuthService.isAllowedAction(actions, 'add') &&
                    colletRolesAction && [
                        <Button key="1" type="primary" id="add-user-btn" onClick={toggleAdd}>
                            <Trans i18nKey="new_user" />
                        </Button>,
                    ]
                }
            />

            {AuthService.isAllowedAction(actions, 'add') && colletRolesAction && (
                <Modal
                    title={<Trans i18nKey="new_user" />}
                    className="add-modal"
                    centered
                    open={isModalVisible}
                    onOk={handleAdd}
                    onCancel={cancelAdd}
                    footer={null}
                    maskClosable={true}
                >
                    <Form
                        layout="vertical"
                        name="users_form"
                        ref={(form) => (addForm = form)}
                        initialValues={initialAddValues}
                        hideRequiredMark
                        onFinish={handleAdd}
                        validateTrigger="onSubmit"
                        onValuesChange={() => setErrorsAdd('')}
                    >
                        {errorsAdd != '' && (
                            <Alert
                                type="error"
                                className="alert-msg"
                                message={
                                    <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsAdd)} />
                                }
                                showIcon
                            />
                        )}
                        <AddUserForm />
                        <Form.Item
                            label={<Trans i18nKey="role.label" />}
                            name="role"
                            rules={[
                                {
                                    required: true,
                                    message: <Trans i18nKey="role.required" />,
                                },
                            ]}
                        >
                            {getSelectRoles()}
                        </Form.Item>

                        <Form.Item className="button-container">
                            <Button type="text" className="cancel-btn prev" block onClick={cancelAdd}>
                                <Trans i18nKey="cancel" />
                            </Button>
                            <Button type="primary" id="submit-btn" htmlType="submit" block>
                                <Trans i18nKey="create" />
                            </Button>
                        </Form.Item>
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

export default withTranslation()(Users);
