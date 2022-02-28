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
import RolesService from "../services/roles.service";

import { PageHeader, Button, Row, Col, Typography, Table, Space, Modal, Popconfirm, notification, Card } from 'antd';
import { Form, Input, Checkbox } from 'antd';
import { DeleteOutlined, SearchOutlined, QuestionCircleOutlined, UserOutlined, EditOutlined, KeyOutlined, WarningOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words/dist/main';
import {FormInstance} from "antd/lib/form";
import {T} from "@transifex/react";

const { Paragraph, Link } = Typography;
const { confirm } = Modal;

type PaginationType = {
    current?: number;
    pageSize?: number;
}
interface Item {
    key: string;
    name: string;
    users: [];
    permissions: [];
}
const EditableContext = React.createContext<FormInstance<any> | null>(null);

const Roles = () => {
    const [data, setData] = React.useState([]);
    const [expandedKeys, setExpandedKeys] = React.useState([]);
    const [pagination, setPagination] = React.useState<PaginationType>({ current: 1, pageSize: 5 });
    const [loading, setLoading] = React.useState(false);
    const [allUsers, setAllUsers] = React.useState([]);
    const [allPrivileges, setAllPrivileges] = React.useState({});

    const [errorsAdd, setErrorsAdd] = React.useState([]);
    const [errorsEdit, setErrorsEdit] = React.useState([]);
    const [isModalVisible, setIsModalVisible] = React.useState(false);

    const [editingKey, setEditingKey] = React.useState(null);

    //edit
    const [form] = Form.useForm();
    interface EditableRowProps {
        index: number;
    }
    const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
        return (
            <Form
                size="middle"
                form={form}
                component={false}
            >
                <EditableContext.Provider value={form}>
                    <tr {...props} />
                </EditableContext.Provider>
            </Form>
        );
    };
    interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
        editing: boolean;
        dataIndex: string;
        title: any;
        record: Item;
        children: React.ReactNode;
        //  handleSave: (record: Item) => void;
    }
    const EditableCell: React.FC<EditableCellProps> = ({editing, dataIndex, title, record, children, ...restProps}) => {
        return (
            <td {...restProps}>
                {editing ? (
                    <div className="ant-form-vertical">
                        <Form.Item
                            //label={title}
                            //className="input-editable"
                            name={dataIndex}
                            {...(errorsEdit.length > 0 && {
                                help: errorsEdit.toString(),
                                validateStatus: "error"
                            })}
                            /*rules={[
                                {
                                    required: true,
                                    message: `${title} is required`,
                                },
                            ]}*/
                        >
                            <Input/>
                        </Form.Item>
                    </div>
                ) : (
                    children
                )}
            </td>
        );
    };

    const [searchText, setSearchText] = React.useState('');
    const [searchedColumn, setSearchedColumn] = React.useState('');

    //list
    const getUsers = () => {
        RolesService.list_users()
            .then((response) => {
                const results = response.data;
                setAllUsers(results);
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const getPrivileges = () => {
        RolesService.list_permissions()
            .then((response) => {
                const privileges = response.data;
                const permissions = {};
                Object.keys(privileges).forEach(function (group) {
                    const arr = privileges[group];
                    arr.map((action) => {
                        const key = action +"__"+ group;
                        permissions[key] = key.replace('__',' ');
                    });
                });
                setAllPrivileges(permissions);
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const getRoles = () => {
        setLoading(true);
        RolesService.list_roles()
            .then((response) => {
                const results = response.data;
                setLoading(false);
                setData(results.data);
            })
            .catch((error) => {
                setLoading(false);
                console.log(error);
            });
    };
    useEffect(() => {
        getUsers();
        getPrivileges();
        getRoles();
    });
    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    //add
    const [addForm] = Form.useForm();
    const openNotificationWithIcon = (type,message) => {
        notification[type]({
            message: type,
            description: message,
        });
    };
    const handleAdd = (formValues: any) => {
        setErrorsAdd([]);
        RolesService.add_role(formValues)
            .then((response) => {
                setLoading(true);
                const result = response.data;
                const newRowData : Item = result.role;
                setIsModalVisible(false);
                openNotificationWithIcon('success','Role successfully added');
                //delete data of form
                addForm.resetFields();
                //add data to table
                setLoading(false);
                setData([...data, newRowData]);
                /*setPagination({
                    ...pagination,
                    total: pagination.total + 1,
                });*/
            })
            .catch((error) => {
                const responseData = error.response.data;
                if (responseData.errors) {
                    const err = [];
                    const errors = responseData.errors;
                    if (typeof errors == 'string') {
                        err.push(errors);
                    }
                    /*
                    if (errors instanceof Object) {
                        Object.values(errors).map((value) => {
                            if (value instanceof Object) {
                                Object.keys(value).map((subKey) => {
                                    err.push(value[subKey]);
                                });
                            }
                            else if(typeof value == 'string') {
                                err.push(value);
                            }
                        });
                    }
                    else if (typeof errors == 'string') {
                        err.push(errors);
                    }
                     */
                    setErrorsAdd(err);
                }
            });
    };
    const toggleAdd = () => {
        addForm.resetFields();
        setErrorsAdd([]);
        setIsModalVisible(true);
    };

    //edit **********edit name cell***********
    const isEditing = (record: Item) => record.key === editingKey;
    const toogleEdit = (record: Partial<Item> & { key: React.Key }) => {
        let keys = [...expandedKeys];
        if (keys.includes(record.key)) {
            keys = keys.filter(item => item !== record.key);
        }
        else {
            keys.push(record.key);
        }
        setExpandedKeys(keys);
    };
    const cancelEdit = (key: React.Key) => {
        setExpandedKeys(expandedKeys.filter(item => item !== key));
    };
    const saveEdit = (formValues: any, key: React.Key) => {
        RolesService.edit_role(formValues,key as number)
            .then((response) => {
                //console.log(response);
                const result = response.data;
                const newRowData = result.role;
                openNotificationWithIcon('success','Role successfully updated');
                const newData = [...data];
                const index = newData.findIndex(item => key === item.key);
                if (index > -1 && newRowData != undefined) {
                    const item = newData[index];
                    newData.splice(index, 1, {
                        ...item,
                        ...newRowData,
                    });
                    setData(newData);
                }
                setExpandedKeys(expandedKeys.filter(item => item !== key));
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const handleName = async (name) => {
        /*try {
            const rowData = (await form.validateFields()) as Item;
            setErrorsEdit([]);
            RolesService.edit_role(rowData,key as number)
                .then((response) => {
                    const result = response.data;
                    const newRowData = result.role;
                    openNotificationWithIcon('success',result.message);
                    //close editable mode
                    //update data in table
                    const newData = [...data];
                    const index = newData.findIndex(item => key === item.key);
                    if (index > -1 && newRowData != undefined) {
                        const item = newData[index];
                        // item => Object { key: 1, name: "rooms_manager", status: "active", users: [], permissions: [] }
                        // Object { name: "administrator" }
                        // replace one element at pos index
                        newData.splice(index, 1, {
                            ...item,
                            ...newRowData,
                        });
                        setData(newData);
                    }
                    setEditingKey(null);
                    setExpandedKeys(expandedKeys.filter(item => item !== key));
                })
                .catch((error) => {
                    console.log(error);
                    const responseData = error.response.data;
                    if (responseData.errors) {
                        const err = [];
                        const errors = responseData.errors;
                        if (errors instanceof Object) {
                            Object.values(errors).map((value) => {
                                if (value instanceof Object) {
                                    Object.keys(value).map((subKey) => {
                                        err.push(value[subKey]);
                                    });
                                }
                                else if(typeof value == 'string') {
                                    err.push(value);
                                }
                            });
                        }
                        else if (typeof errors == 'string') {
                            err.push(errors);
                        }
                        setErrorsEdit(err);
                    }
                });
        }
        catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }*/
    }

    //delete
    const deleteRole = (key,nbUsers) => {
        RolesService.delete_role(key as number)
            .then((response) => {
                setLoading(true);
                if (nbUsers > 0) {
                    // reload data to get switched users
                    const results = response.data;
                    setData(results.data);
                }
                else {
                    // delete item of this page and add next role to table
                    const newData = [...data];
                    setData(newData.filter(item => item.key !== key));
                }
                setLoading(false);
                openNotificationWithIcon('success','Role successfully deleted');
            })
            .catch((error) => {
                console.log(error.response);
            });
    }
    const handleDelete = (key: React.Key, nbUsers) => {
        if (nbUsers > 0) {
            confirm({
                title: 'Do you Want to delete this role ?',
                icon: <WarningOutlined />,
                content: 'This role already has users assigned, if you confirm all users switch to role \'Lecturer\'',
                okType: 'danger',
                okText: 'Yes',
                cancelText: 'No',
                onOk() {
                    deleteRole(key,nbUsers);
                },
            });
        }
        else {
            deleteRole(key,nbUsers);
        }
    };

    //search
    let searchInput;
    const handleSearch = (selectedKeys, confirm, dataIndex, closed = false) => {
        if (closed)
            confirm({ closeDropdown: false });
        else
            confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = clearFilters => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div className="table-search-bloc">
                <Input
                    ref={node => {
                        searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    size="middle"
                    className="table-search-input"
                />
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        className="table-search-btn"
                        icon={<SearchOutlined />}
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    >
                        Search
                    </Button>
                    <Button
                        size="small"
                        className="table-search-btn"
                        onClick={() => handleReset(clearFilters)}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        className="table-search-btn"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex, true)}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.select(), 100);
            }
        },
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            //editable: true,
            //width: '30%',
            ...getColumnSearchProps('name'),
            render: (name) => {
                let newName = name;
                if (name != '') {
                    name = name.replace('_', ' ');
                    newName = name[0].toUpperCase() + name.slice(1);
                }
                return newName;
            }
        },
        {
            title: 'N◦ Users',
            dataIndex: 'users',
            editable: false,
            render: (users) => {
                const nbUsers = users.length;
                return (
                    <Space size="small">
                        <UserOutlined />
                        <span>{nbUsers}</span>
                    </Space>
                )
            },
        },
        {
            title: 'Permissions',
            dataIndex: 'permissions',
            editable: false,
            render: (permissions) => {
                const nbPermissions = permissions.length;
                return (
                    <Space size="small">
                        <KeyOutlined />
                        <span>{nbPermissions}</span>
                    </Space>
                )
            },
        },
        {
            className: 'text-center',
            editable: false,
            render: (text, record) => {
                return (
                    <Space size="middle" className={expandedKeys.includes(record.key)? 'table-actions editable' : 'table-actions'}>
                        {record.key != 1 &&
                            <Link onClick={() => toogleEdit(record)}>
                                <KeyOutlined/> Permissions
                            </Link>
                        }
                        {record.key != 1 && record.key != 2 &&
                            <Popconfirm
                                title="Are you sure to delete this role ?"
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                //visible={visible}
                                //okButtonProps={{ loading: confirmLoading }}
                                onConfirm={() => handleDelete(record.key,record.users.length)}>
                                <Link>
                                    <DeleteOutlined /> Delete
                                </Link>
                            </Popconfirm>
                        }
                    </Space>
                );
            },
        },
    ];
    /*const mergedColumns = columns.map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: Item) => ({
                record,
                title: col.title,
                dataIndex: col.dataIndex,
                editing: isEditing(record),
            }),
        };
    });*/
    const expandedRowRender = (record) => {
        const usersChecked = record.users;
        const permissionsChecked = record.permissions;

        const initialValues = {
            users: usersChecked,
            permissions: permissionsChecked,
        };
        return (
            <Form initialValues={initialValues} onFinish={(values) => saveEdit(values,record.key)}>
                <Card bordered={false} className='card-parent'>
                    <Card
                        type="inner"
                        title="Users">
                        <Form.Item name="users">
                            <Checkbox.Group>
                                <Row gutter={[32, 16]}>
                                    {allUsers.map((item,index) => (
                                        <Col span={allUsers.length > 6 && 4} key={index}>
                                            <Checkbox value={item.key} className="text-capitalize">{item.username}</Checkbox>
                                        </Col>
                                    ))}
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>
                    </Card>
                    <Card
                        style={{ marginTop: 16 }}
                        type="inner"
                        title="Permissions"
                    >
                        <Form.Item name="permissions">
                            <Checkbox.Group>
                                <Row gutter={[32, 16]}>
                                    {Object.entries(allPrivileges).map(([key, value]) => (
                                        <Col span={Object.keys(allPrivileges).length > 6 && 4} key={key}>
                                            <Checkbox value={key} className="text-capitalize">{value}</Checkbox>
                                        </Col>
                                    ))}
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>
                    </Card>
                    <Space size="middle" className="actions-expanded">
                        <Popconfirm title="Sure to cancel edition ?" placement="leftTop" onConfirm={() => cancelEdit(record.key)}>
                            <Button size="middle">Cancel</Button>
                        </Popconfirm>
                        <Button size="middle" type="primary" htmlType="submit">Save</Button>
                    </Space>
                </Card>
            </Form>
        )
    };

    return (
        <Paragraph>
            <PageHeader
                className="site-page-header"
                title="Roles"
                extra={[
                    <Button key="1" type="primary" onClick={toggleAdd}>
                        New Role
                    </Button>
                ]}
            />

            <Modal
                title="New Role"
                className="roles-modal"
                centered
                visible={isModalVisible}
                onOk={handleAdd}
                onCancel={() => setIsModalVisible(false)}
                cancelButtonProps={{ className: 'hidden' }}
                footer={null}
                //okButtonProps={{ className: 'hidden' }}
            >
                <Form
                    form={addForm}
                    hideRequiredMark
                    onFinish={handleAdd}
                    validateTrigger="onSubmit"
                >
                    <Form.Item
                        label={<T _str="Name" />}
                        name="name"
                        {...(errorsAdd.length > 0 && {
                            help: errorsAdd.toString(),
                            validateStatus: "error"
                        })}
                        /*rules={[
                            {
                                required: true,
                                message: <T _str="Name is required" />,
                            },
                        ]}*/
                    >
                        <Input placeholder="Name" />
                    </Form.Item>
                    <Form.Item className="modal-submit-btn">
                        <Button type="primary" htmlType="submit" block>
                            <T _str="Create role" />
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Row justify="center" className="labels-content">
                <Col span={24}>
                    <Table
                        className="hivelvet-table"
                        components={{
                            body: {
                                cell: EditableCell,
                                row: EditableRow,
                            },
                        }}
                        columns={columns}
                        dataSource={data}
                        pagination={pagination}
                        loading={loading}
                        onChange={handleTableChange}

                        expandable={{
                            expandedRowRender,
                            showExpandColumn: false,
                            expandedRowKeys: expandedKeys
                        }}
                    />
                </Col>
            </Row>
        </Paragraph>
    );
}

export default Roles;

