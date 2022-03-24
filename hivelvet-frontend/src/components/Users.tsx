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

import React, { useEffect } from 'react';
import UsersService from '../services/users.service';
import PaginationType from './PaginationType';
import NotificationsService from '../services/notifications.service';
import { Trans, withTranslation } from 'react-i18next';
import EN_US from '../locale/en-US.json';
import { t } from 'i18next';

import { Alert, Button, Form, Input, Modal, PageHeader, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words/dist/main';
import { FormInstance } from 'antd/lib/form';

const { Option } = Select;
const { Link } = Typography;

interface Item {
    key: number;
    username: string;
    email: string;
    status: string;
    role: string;
}

interface EditableRowProps {
    index: number;
}
interface EditableCellProps {
    title: React.ReactNode;
    editing: boolean;
    children: React.ReactNode;
    dataIndex: keyof Item;
    record: Item;
    inputType: 'text' | 'select';
    index: number;
}
const EditableContext = React.createContext<FormInstance<any> | null>(null);

const Users = () => {
    const [data, setData] = React.useState([]);
    const [allStates, setAllStates] = React.useState<string[]>([]);
    const [allRoles, setAllRoles] = React.useState({});
    //const [editingKeys, setEditingKeys] = React.useState<number[]>([]);
    const [editingKey, setEditingKey] = React.useState<number>(null);
    const [pagination, setPagination] = React.useState<PaginationType>({ current: 1, pageSize: 5 });
    const [loading, setLoading] = React.useState<boolean>(false);
    const [errorsAdd, setErrorsAdd] = React.useState('');
    const [errorsEdit, setErrorsEdit] = React.useState({});
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [searchText, setSearchText] = React.useState('');
    const [searchedColumn, setSearchedColumn] = React.useState('');

    //list
    const getRoles = () => {
        UsersService.list_roles()
            .then((response) => {
                const roles = response.data.roles;
                if (roles instanceof Object) {
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
                setLoading(false);
                if (response.data.users) {
                    setData(response.data.users);
                }
                if (response.data.states) {
                    const states = response.data.states;
                    setAllStates(states);
                }
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    };
    useEffect(() => {
        //Runs only on the first render
        getRoles();
        getUsers();
    }, []);
    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    // add
    let addForm: FormInstance = null;
    const initialAddValues = {
        username: '',
        email: '',
        password: '',
    };
    const handleAdd = (formValues: any) => {
        const res = Object.keys(allRoles).filter((key) => allRoles[key] == formValues.role);
        formValues.role = res ? res[0] : formValues;
        setErrorsAdd('');
        UsersService.add_user(formValues)
            .then((response) => {
                setLoading(true);
                setIsModalVisible(false);
                const newRowData: Item = response.data.user;
                NotificationsService.openNotificationWithIcon('success', t('add_user_success'));
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
    const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
        return (
            <Form size="middle" form={editForm} component={false} validateTrigger="onSubmit">
                <EditableContext.Provider value={editForm}>
                    <tr {...props} />
                </EditableContext.Provider>
            </Form>
        );
    };
    const EditableCell: React.FC<EditableCellProps> = ({
        title,
        editing,
        children,
        dataIndex,
        record,
        inputType,
        index,
        ...restProps
    }) => {
        let inputNode;
        if (inputType === 'select') {
            if (dataIndex == 'role') {
                inputNode = (
                    <Select
                        className="select-field"
                        showSearch
                        allowClear
                        placeholder={t('role.placeholder')}
                        filterSort={(optionA, optionB) =>
                            optionA.children
                                .toString()
                                .toLowerCase()
                                .localeCompare(optionB.children.toString().toLowerCase())
                        }
                    >
                        {Object.entries(allRoles).map(([id, name]) => (
                            <Option key={id} value={name} className="text-capitalize">
                                {name}
                            </Option>
                        ))}
                    </Select>
                );
            } else if (dataIndex == 'status') {
                inputNode = (
                    <Select
                        className="select-field"
                        showSearch
                        allowClear
                        placeholder={t('status.placeholder')}
                        filterSort={(optionA, optionB) =>
                            optionA.children
                                .toString()
                                .toLowerCase()
                                .localeCompare(optionB.children.toString().toLowerCase())
                        }
                    >
                        {allStates.map((item, index) => (
                            <Option key={index} value={item} className="text-capitalize">
                                {t(item)}
                            </Option>
                        ))}
                    </Select>
                );
            }
        } else {
            inputNode = <Input />;
        }
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item
                        name={dataIndex}
                        className="input-editable editable-row" /**/
                        {...(dataIndex in errorsEdit &&
                            record.key == errorsEdit['key'] && {
                                help: (
                                    <Trans
                                        i18nKey={Object.keys(EN_US).filter(
                                            (elem) => EN_US[elem] == errorsEdit[dataIndex]
                                        )}
                                    />
                                ),
                                validateStatus: 'error',
                            })}
                        rules={[
                            {
                                required: true,
                                message: t('required_' + dataIndex),
                            },
                        ]}
                    >
                        {inputNode}
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    };
    //const isEditing = (record: Item) => editingKeys.includes(record.key);
    const isEditing = (record: Item) => record.key == editingKey;
    const toggleEdit = (record) => {
        setEditingKey(record.key);
        /*const keys = [...editingKeys];
        if (!keys.includes(record.key)) {
            keys.push(record.key);
            console.log(keys);
            setEditingKeys(keys);
        }*/
        editForm.setFieldsValue({ username: '', email: '', role: '', status: '', ...record });
    };
    const cancelEdit = (key: React.Key) => {
        setEditingKey(null);
        //setEditingKeys(editingKeys.filter((item) => item !== key));
    };
    const saveEdit = async (key) => {
        try {
            const formValues: any = (await editForm.validateFields()) as Item;
            const res = Object.keys(allRoles).filter((key) => allRoles[key] == formValues.role);
            formValues.role = res ? res[0] : formValues;
            setErrorsEdit({});
            UsersService.edit_user(formValues, key)
                .then((response) => {
                    const newRowData = response.data.user;
                    const newData = [...data];
                    const index = newData.findIndex((item) => key === item.key);
                    if (index > -1 && newRowData != undefined) {
                        const item = newData[index];
                        newData.splice(index, 1, {
                            ...item,
                            ...newRowData,
                        });
                        setData(newData);
                        setEditingKey(null);
                    }
                    NotificationsService.openNotificationWithIcon('success', t('edit_user_success'));
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
            const errors = errInfo.errorFields;
            const err = {};
            errors.map((error) => {
                const errorKey = error['name'][0];
                err[errorKey] = error['errors'][0];
            });
            console.log(err);
            //setErrorsEdit(err);
        }
    };

    // delete
    const handleDelete = (key: React.Key) => {
        UsersService.delete_user(key as number)
            .then((response) => {
                setLoading(true);
                const newData = [...data];
                /*
                // delete item of this page
                setLoading(false);
                setData(newData.filter((item) => item.key !== key));
                */
                // update item
                const newRowData = response.data.user;
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
                NotificationsService.openNotificationWithIcon('success', t('delete_user_success'));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // search
    let searchInput;
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const handleSearch = (selectedKeys, confirm, dataIndex, closed = false) => {
        if (closed) confirm({ closeDropdown: false });
        else confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div className="table-search-bloc">
                <Input
                    size="middle"
                    className="table-search-input"
                    ref={(node) => {
                        searchInput = node;
                    }}
                    placeholder={t('search') + ' ' + t(dataIndex + '_col')}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                />
                <Space className="table-search-btn">
                    <Button
                        type="primary"
                        size="small"
                        icon={<SearchOutlined />}
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    >
                        {' '}
                        <Trans i18nKey="search" />
                    </Button>
                    <Button size="small" onClick={() => handleReset(clearFilters)}>
                        <Trans i18nKey="reset" />
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex, true)}
                    >
                        <Trans i18nKey="filter" />
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined className={filtered ? 'search-icon-filtered' : undefined} />,
        onFilter: (value, record) => {
            return record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '';
        },
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.select(), 100);
            }
        },
        render: (text) => {
            if (dataIndex == 'username' || dataIndex == 'role') {
                text = text[0].toUpperCase() + text.slice(1);
            }
            return searchedColumn === dataIndex ? (
                <Highlighter searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} />
            ) : (
                text
            );
        },
    });

    const columns = [
        {
            title: t('username_col'),
            dataIndex: 'username',
            editable: true,
            ...getColumnSearchProps('username'),
            width: '20%',
            sorter: {
                compare: (a, b) => a.username.localeCompare(b.username),
                multiple: 4,
            },
        },
        {
            title: t('email_col'),
            dataIndex: 'email',
            editable: true,
            ...getColumnSearchProps('email'),
            width: '30%',
            sorter: {
                compare: (a, b) => a.username.localeCompare(b.username),
                multiple: 3,
            },
        },
        {
            title: t('role_col'),
            dataIndex: 'role',
            editable: true,
            ...getColumnSearchProps('role'),
            width: '15%',
            sorter: {
                compare: (a, b) => a.username.localeCompare(b.username),
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
            sorter: {
                compare: (a, b) => a.username.localeCompare(b.username),
                multiple: 1,
            },
        },
        {
            title: t('actions_col'),
            editable: false,
            render: (text, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space size="middle">
                        <Popconfirm
                            title={t('cancel_edit')}
                            placement="leftTop"
                            onConfirm={() => cancelEdit(record.key)}
                        >
                            <Button size="middle">
                                <Trans i18nKey="cancel" />
                            </Button>
                        </Popconfirm>
                        <Button size="middle" type="primary" onClick={() => saveEdit(record.key)}>
                            <Trans i18nKey="save" />
                        </Button>
                    </Space>
                ) : (
                    <Space size="middle" className="table-actions">
                        <Link disabled={editingKey !== null} onClick={() => toggleEdit(record)}>
                            <EditOutlined /> <Trans i18nKey="edit" />
                        </Link>
                        <Popconfirm
                            title={t('delete_user_confirm')}
                            icon={<QuestionCircleOutlined className="red-icon" />}
                            onConfirm={() => handleDelete(record.key)}
                        >
                            <Link>
                                <DeleteOutlined /> <Trans i18nKey="delete" />
                            </Link>
                        </Popconfirm>
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
            onCell: (record: Item) => ({
                record,
                inputType: col.dataIndex === 'role' || col.dataIndex === 'status' ? 'select' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
            onRow: (record: Item, rowIndex) => ({
                index: rowIndex,
            }),
        };
    });

    return (
        <>
            <PageHeader
                className="site-page-header"
                title={<Trans i18nKey="users" />}
                extra={[
                    <Button key="1" type="primary" onClick={toggleAdd}>
                        <Trans i18nKey="new_user" />
                    </Button>,
                ]}
            />

            <Modal
                title={<Trans i18nKey="new_user" />}
                className="add-modal"
                centered
                visible={isModalVisible}
                onOk={handleAdd}
                onCancel={cancelAdd}
                footer={null}
            >
                <Form
                    layout="vertical"
                    ref={(form) => (addForm = form)}
                    initialValues={initialAddValues}
                    hideRequiredMark
                    onFinish={handleAdd}
                    validateTrigger="onSubmit"
                >
                    {errorsAdd != '' && (
                        <Alert
                            type="error"
                            className="alert-msg"
                            message={<Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsAdd)} />}
                            showIcon
                        />
                    )}

                    <Form.Item
                        label={<Trans i18nKey="username.label" />}
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: <Trans i18nKey="username.required" />,
                            },
                            {
                                min: 4,
                                message: <Trans i18nKey="username.size" />,
                            },
                        ]}
                    >
                        <Input placeholder={t('username.label')} />
                    </Form.Item>

                    <Form.Item
                        label={<Trans i18nKey="email.label" />}
                        name="email"
                        rules={[
                            {
                                type: 'email',
                                message: <Trans i18nKey="email.invalid" />,
                            },
                            {
                                required: true,
                                message: <Trans i18nKey="email.required" />,
                            },
                        ]}
                    >
                        <Input placeholder={t('email.label')} />
                    </Form.Item>
                    <Form.Item
                        label={<Trans i18nKey="password.label" />}
                        name="password"
                        rules={[
                            {
                                min: 4,
                                message: <Trans i18nKey="password.size" />,
                            },
                            {
                                required: true,
                                message: <Trans i18nKey="password.required" />,
                            },
                        ]}
                    >
                        <Input.Password placeholder="**********" />
                    </Form.Item>

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
                        <Select
                            className="select-field"
                            showSearch
                            allowClear
                            placeholder={t('role.placeholder')}
                            filterSort={(optionA, optionB) =>
                                optionA.children
                                    .toString()
                                    .toLowerCase()
                                    .localeCompare(optionB.children.toString().toLowerCase())
                            }
                        >
                            {Object.entries(allRoles).map(([id, name]) => (
                                <Option key={id} value={name} className="text-capitalize">
                                    {name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item className="modal-submit-btn button-container">
                        <Button type="text" className="cancel-btn prev" block onClick={cancelAdd}>
                            <Trans i18nKey="cancel" />
                        </Button>
                        <Button type="primary" htmlType="submit" block>
                            <Trans i18nKey="create" />
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Table
                className="hivelvet-table"
                components={{
                    body: {
                        cell: EditableCell,
                        row: EditableRow,
                    },
                }}
                columns={mergedColumns}
                dataSource={data}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />
        </>
    );
};

export default withTranslation()(Users);
