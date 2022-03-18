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

import React, { Component } from 'react';
import UsersService from "../services/users.service";
import PaginationType from './PaginationType';

import { PageHeader, Button, Typography, Table, Space, Modal, Popconfirm, Tag, Alert } from 'antd';
import { Form, Input, Select } from 'antd';
import { DeleteOutlined, SearchOutlined, QuestionCircleOutlined, EditOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words/dist/main';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';
import NotificationsService from "../services/notifications.service";

const { Option } = Select;
const { Link } = Typography;

interface Item {
    key: number;
    username: string;
    email: string;
    role: {};
    status: string;
}

type Props = {};
type State = {
    data?: any[];
    editingKeys?: number[];
    changedKeys?: number[];
    pagination?: PaginationType;
    loading?: boolean;

    allRoles?: {};

    errorsAdd?: string;
    errorsEdit?: {};
    isModalVisible?: boolean;

    searchText?: string;
    searchedColumn?: string;
};

class Users extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            allRoles: {},
            data: [],
            pagination: {
                current: 1,
                pageSize: 5,
            },
            loading: false,

            errorsAdd: '',
            errorsEdit: {},
            isModalVisible: false,

            editingKeys: [],
            changedKeys: [],
            searchText: '',
            searchedColumn: '',
        };
    }

    //list
    getRoles = () => {
        UsersService.list_roles()
            .then((response) => {
                const roles = response.data.roles;
                if (roles instanceof Object) {
                    this.setState({ allRoles: roles });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };
    getUsers = () => {
        this.setState({ loading: true });
        UsersService.list_users()
            .then((response) => {
                const results = response.data;
                this.setState({
                    loading: false,
                    data: results,
                });
            })
            .catch((error) => {
                this.setState({ loading: false });
                console.log(error);
            });
    };
    componentDidMount() {
        //Runs only on the first render
        this.getRoles();
        this.getUsers();
    }
    handleTableChange = (pagination) => {
        this.setState({ pagination: pagination });
    };

    // add
    addForm = null;
    handleAdd = (formValues: any) => {
        const allRoles = this.state.allRoles;
        const res = Object.keys(allRoles).filter((key) => allRoles[key] == formValues.role);
        formValues.role = res ? res[0] : formValues;
        this.setState({ errorsAdd: '' });
        UsersService.add_user(formValues)
            .then((response) => {
                this.setState({
                    loading: true,
                    isModalVisible: false,
                });
                const result = response.data;
                const newRowData: Item = result.user;
                NotificationsService.openNotificationWithIcon('success', t('add_user_success'));
                //delete data of form
                this.addForm?.resetFields();
                //add data to table
                this.setState({
                    loading: false,
                    data: [...this.state.data, newRowData],
                });
            })
            .catch((error) => {
                const responseData = error.response.data;
                if (responseData.message) {
                    this.setState({
                        errorsAdd: responseData.message,
                    });
                }
            });
    };
    cancelAdd = () => {
        this.setState({ isModalVisible: false });
    };
    toggleAdd = () => {
        this.addForm?.resetFields();
        this.setState({
            errorsAdd: '',
            isModalVisible: true,
        });
    };

    // delete
    handleDelete = (key: React.Key) => {
        UsersService.delete_user(key as number)
            .then((response) => {
                this.setState({ loading: true });
                const newData = [...this.state.data];
                /*
                // delete item of this page
                this.setState({
                    data: newData.filter((item) => item.key !== key),
                    loading: false,
                });
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
                    this.setState({
                        data: newData,
                        loading: false,
                    });
                }
                NotificationsService.openNotificationWithIcon('success', t('delete_user_success'));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // search
    searchInput;
    handleReset = (clearFilters) => {
        clearFilters();
        this.setState({ searchText: '' });
    };
    handleSearch = (selectedKeys, confirm, dataIndex, closed = false) => {
        if (closed) confirm({ closeDropdown: false });
        else confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };
    getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div className="table-search-bloc">
                <Input
                    size="middle"
                    className="table-search-input"
                    ref={(node) => {
                        this.searchInput = node;
                    }}
                    placeholder={t('search') + ' ' + t(dataIndex + '_col')}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                />
                <Space className="table-search-btn">
                    <Button
                        type="primary"
                        size="small"
                        icon={<SearchOutlined />}
                        onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    >
                        {' '} <Trans i18nKey="search" />
                    </Button>
                    <Button size="small" onClick={() => this.handleReset(clearFilters)}>
                        <Trans i18nKey="reset" />
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex, true)}
                    >
                        <Trans i18nKey="filter" />
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined className={filtered ? 'search-icon-filtered' : undefined} />,
        onFilter: (value, record) => {
            let text;
            if (dataIndex == 'role' && record[dataIndex]) {
                /*if (value.indexOf(' ') != -1) {
                    value = value[0] == ' ' ? value.slice(1) : value;
                    value = value[value.length - 1] == ' ' ? value.slice(0, -1) : value;
                    value = value.replace(' ', '_');
                }*/
                text = Object.values(record[dataIndex])[0];
                return text.toString().toLowerCase().includes(value.toLowerCase());
            }
            return record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '';
        },
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => this.searchInput.select(), 100);
            }
        },
        render: (text) => {
            if (dataIndex == 'username' && text != '') {
                text = text[0].toUpperCase() + text.slice(1);
            }
            else if (dataIndex == 'role' && text != '') {
                text = Object.values(text)[0].toString();
                text = text[0].toUpperCase() + text.slice(1);
            }
            return this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    searchWords={[this.state.searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            );
        },
    });

    render() {
        const { data, pagination, loading, isModalVisible, errorsAdd, allRoles } = this.state;
        const initialAddValues = {
            username: '',
            email: '',
            password: '',
        };
        const columns = [
            {
                title: t('username_col'),
                dataIndex: 'username',
                editable: true,
                ...this.getColumnSearchProps('username'),
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
                ...this.getColumnSearchProps('email'),
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
                ...this.getColumnSearchProps('role'),
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
                    return (
                        <Tag color={color}>{ t(status) }</Tag>
                    );
                },
                filters: [
                    {
                        text: t('active'),
                        value: 'active',
                    },
                    {
                        text: t('inactive'),
                        value: 'inactive',
                    },
                    {
                        text: t('pending'),
                        value: 'pending',
                    },
                    {
                        text: t('deleted'),
                        value: 'deleted',
                    },
                ],
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
                    return (
                        <Space size="middle" className='table-actions'>
                            <Link>
                                <EditOutlined /> <Trans i18nKey="edit" />
                            </Link>
                            <Popconfirm
                                title={t('delete_user_confirm')}
                                icon={<QuestionCircleOutlined className="red-icon" />}
                                onConfirm={() => this.handleDelete(record.key)}
                            >
                                <Link>
                                    <DeleteOutlined /> <Trans i18nKey="delete" />
                                </Link>
                            </Popconfirm>
                        </Space>
                    )
                },
            },
        ];

        return (
            <>
                <PageHeader
                    className="site-page-header"
                    title={<Trans i18nKey="users" />}
                    extra={[
                        <Button key="1" type="primary" onClick={this.toggleAdd}>
                            <Trans i18nKey="new_user" />
                        </Button>,
                    ]}
                />

                <Modal
                    title={<Trans i18nKey="new_user" />}
                    className="add-modal"
                    centered
                    visible={isModalVisible}
                    onOk={this.handleAdd}
                    onCancel={this.cancelAdd}
                    footer={null}
                >
                    <Form
                        layout="vertical"
                        ref={(form) => (this.addForm = form)}
                        initialValues={initialAddValues}
                        hideRequiredMark
                        onFinish={this.handleAdd}
                        validateTrigger="onSubmit"
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
                                className="select-role"
                                showSearch
                                allowClear
                                placeholder={t('role.placeholder')}
                                filterSort={(optionA, optionB) =>
                                    optionA.children.toString().toLowerCase().localeCompare(optionB.children.toString().toLowerCase())
                                }
                            >
                                {Object.entries(allRoles).map(([id, name]) => (
                                    <Option key={id} value={name} className="text-capitalize">{name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item className="modal-submit-btn button-container">
                            <Button type="text" className="cancel-btn prev" block onClick={this.cancelAdd}>
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
                    columns={columns}
                    dataSource={data}
                    pagination={pagination}
                    loading={loading}
                    onChange={this.handleTableChange}
                />
            </>
        );
    }
}

export default withTranslation()(Users);
