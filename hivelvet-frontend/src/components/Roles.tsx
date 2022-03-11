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

import React, { useContext, useState, useEffect, useRef, Component } from 'react';
import RolesService from '../services/roles.service';

import { PageHeader, Button, Row, Col, Typography, Table, Space, Modal, Popconfirm, notification, Card } from 'antd';
import { Form, Input, Checkbox } from 'antd';
import {
    DeleteOutlined,
    SearchOutlined,
    QuestionCircleOutlined,
    UserOutlined,
    EditOutlined,
    KeyOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words/dist/main';
import { FormInstance } from 'antd/lib/form';
import { T } from '@transifex/react';

const { Paragraph, Link } = Typography;

type PaginationType = {
    current?: number;
    pageSize?: number;
};

interface Item {
    key: number;
    name: string;
    users: number;
    permissions: {};
}

interface EditableRowProps {
    index: number;
}
interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof Item;
    record: Item;
}
const EditableContext = React.createContext<FormInstance<any> | null>(null);

type Props = {};
type State = {
    data?: any[];
    expandedKeys?: number[];
    pagination?: PaginationType;
    loading?: boolean;

    allPrivileges?: {};

    errorsAdd?: [];
    isModalVisible?: boolean;

    searchText?: string;
    searchedColumn?: string;

    addForm?: any;
};

class Roles extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            allPrivileges: {},
            data: [],
            pagination: {
                current: 1,
                pageSize: 5,
            },
            loading: false,

            errorsAdd: [],
            isModalVisible: false,

            expandedKeys: [],
            searchText: '',
            searchedColumn: '',
        };
    }

    //list
    getPrivileges = () => {
        RolesService.list_permissions()
            .then((response) => {
                const privileges = response.data;
                if (privileges instanceof Object) {
                    this.setState({ allPrivileges: privileges });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };
    getRoles = () => {
        this.setState({ loading: true });
        RolesService.list_roles()
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
        this.getPrivileges();
        this.getRoles();
    }
    handleTableChange = (pagination) => {
        this.setState({ pagination: pagination });
    };

    openNotificationWithIcon = (type, message) => {
        notification[type]({
            message: type[0].toUpperCase() + type.slice(1),
            description: message,
        });
    };

    //add
    addForm = null;
    handleAdd = (formValues: any) => {
        const name = formValues.name;
        delete formValues.name;
        this.setState({ errorsAdd: [] });
        RolesService.add_role({ name: name, permissions: formValues })
            .then((response) => {
                this.setState({
                    loading: true,
                    isModalVisible: false,
                });
                const result = response.data;
                const newRowData: Item = result.role;
                this.openNotificationWithIcon('success', 'Role successfully added');
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
                if (responseData.errors) {
                    this.setState({ errorsAdd: responseData.errors });
                }
            });
    };
    cancelAdd = () => {
        this.setState({ isModalVisible: false });
    };
    toggleAdd = () => {
        this.addForm?.resetFields();
        this.setState({
            errorsAdd: [],
            isModalVisible: true,
        });
    };

    //edit permissions
    editRow = (response, key) => {
        const result = response.data;
        const newRowData = result.role;
        this.openNotificationWithIcon('success', 'Role successfully updated');
        const newData = [...this.state.data];
        const index = newData.findIndex((item) => key === item.key);
        if (index > -1 && newRowData != undefined) {
            const item = newData[index];
            newData.splice(index, 1, {
                ...item,
                ...newRowData,
            });
            this.setState({
                data: newData,
            });
        }
    };
    toggleEdit = (key) => {
        let keys = [...this.state.expandedKeys];
        if (keys.includes(key)) {
            keys = keys.filter((item) => item !== key);
        } else {
            keys.push(key);
        }
        this.setState({ expandedKeys: keys });
    };
    cancelEdit = (key: React.Key) => {
        this.setState({
            expandedKeys: this.state.expandedKeys.filter((item) => item !== key),
        });
    };
    saveEdit = (formValues, key: React.Key) => {
        RolesService.edit_role({ permissions: formValues }, key)
            .then((response) => {
                this.editRow(response, key);
                this.setState({
                    expandedKeys: this.state.expandedKeys.filter((item) => item !== key),
                });
            })
            .catch((error) => {
                console.log(error);
            });
    };
    expandedRowRender = (record) => {
        const { allPrivileges } = this.state;
        const permissionsChecked = record.permissions;

        return (
            <Form initialValues={permissionsChecked} onFinish={(values) => this.saveEdit(values, record.key)}>
                <Card bordered={false} className="card-parent">
                    {Object.keys(allPrivileges).map((group) => (
                        <Card key={group} title={group} className="card-mt text-capitalize" type="inner">
                            <Form.Item name={group}>
                                <Checkbox.Group>
                                    <Row gutter={[32, 16]}>
                                        {allPrivileges[group].map((action) => (
                                            <Col span={Object.keys(allPrivileges).length > 6 && 4} key={action}>
                                                <Checkbox value={action} className="text-capitalize">
                                                    {action}
                                                </Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>
                        </Card>
                    ))}
                    <Space size="middle" className="actions-expanded">
                        <Popconfirm
                            title="Sure to cancel edition ?"
                            placement="leftTop"
                            onConfirm={() => this.cancelEdit(record.key)}
                        >
                            <Button size="middle">Cancel</Button>
                        </Popconfirm>
                        <Button size="middle" type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Space>
                </Card>
            </Form>
        );
    };

    // edit name
    EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
        const [editForm] = Form.useForm();
        return (
            <Form size="middle" form={editForm} component={false}>
                <EditableContext.Provider value={editForm}>
                    <tr {...props} />
                </EditableContext.Provider>
            </Form>
        );
    };
    EditableCell: React.FC<EditableCellProps> = ({ title, editable, children, dataIndex, record, ...restProps }) => {
        const [editing, setEditing] = useState(false);
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
            editForm.setFieldsValue({ [dataIndex]: record[dataIndex] });
        };
        const saveName = async () => {
            try {
                const values = (await editForm.validateFields()) as Item;
                const key = record.key;
                setErrorsEdit({});
                RolesService.edit_role(values, key)
                    .then((response) => {
                        toggleEditName();
                        this.editRow(response, key);
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

        return (
            <td {...restProps}>
                {editable ? (
                    editing ? (
                        <Form.Item
                            name={dataIndex}
                            className="input-editable"
                            {...(dataIndex in errorsEdit &&
                                record.key == errorsEdit['key'] && {
                                    help: errorsEdit[dataIndex],
                                    validateStatus: 'error',
                                })}
                            rules={[
                                {
                                    required: true,
                                    message: <T _str={`${title} is required.`} />,
                                },
                            ]}
                        >
                            <Input ref={inputRef} onPressEnter={saveName} />
                        </Form.Item>
                    ) : (
                        <div className="editable-cell-value-wrap">
                            {children}
                            <Button size="small" type="link" icon={<EditOutlined />} onClick={toggleEditName} />
                        </div>
                    )
                ) : (
                    children
                )}
            </td>
        );
    };

    //delete
    deleteRole = (key, nbUsers) => {
        RolesService.delete_role(key)
            .then((response) => {
                this.setState({ loading: true });
                const newData = [...this.state.data];
                if (nbUsers > 0 && response.data.lecturer) {
                    const LecturerRowData = response.data.lecturer;
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
                // delete item of this page and add next role to table
                this.setState({
                    data: newData.filter((item) => item.key !== key),
                    loading: false,
                });
                this.openNotificationWithIcon('success', 'Role successfully deleted');
            })
            .catch((error) => {
                console.log(error);
            });
    };
    handleDelete = (key: React.Key, nbUsers) => {
        if (nbUsers > 0) {
            Modal.confirm({
                title: <T _str="Do you Want to delete this role ?" />,
                icon: <WarningOutlined />,
                content: (
                    <T _str="This role already has users assigned, if you confirm all users switch to role Lecturer" />
                ),
                okType: 'danger',
                okText: <T _str="Yes" />,
                cancelText: <T _str="No" />,
                onOk: () => this.deleteRole(key, nbUsers),
            });
        } else {
            this.deleteRole(key, nbUsers);
        }
    };

    //search
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
                    placeholder={`Search ${dataIndex}`}
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
                        Search
                    </Button>
                    <Button size="small" onClick={() => this.handleReset(clearFilters)}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex, true)}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined className={filtered ? 'search-icon-filtered' : undefined} />,
        onFilter: (value, record) => {
            if (value.indexOf(' ') != -1) {
                value = value[0] == ' ' ? value.slice(1) : value;
                value = value[value.length - 1] == ' ' ? value.slice(0, -1) : value;
                value = value.replace(' ', '_');
            }
            return record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '';
        },
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => this.searchInput.select(), 100);
            }
        },
        render: (text) => {
            if (dataIndex == 'name' && text != '') {
                text = text.replace('_', ' ');
                text = text[0].toUpperCase() + text.slice(1);
            }
            return this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    //highlightClassName ='search-text-highlighted'
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
        const { data, pagination, loading, isModalVisible, errorsAdd, allPrivileges, expandedKeys } = this.state;

        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                editable: true,
                width: '35%',
                ...this.getColumnSearchProps('name'),
            },
            {
                title: 'N◦ Users',
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
            },
            {
                className: 'text-center',
                editable: false,
                render: (text, record) => {
                    return (
                        <Space
                            size="middle"
                            className={expandedKeys.includes(record.key) ? 'table-actions editable' : 'table-actions'}
                        >
                            {record.key != 1 && (
                                <Link onClick={() => this.toggleEdit(record.key)}>
                                    <KeyOutlined /> Permissions
                                </Link>
                            )}
                            {record.key != 1 && record.key != 2 && (
                                <Popconfirm
                                    title="Are you sure to delete this role ?"
                                    icon={<QuestionCircleOutlined className="red-icon" />}
                                    onConfirm={() => this.handleDelete(record.key, record.users)}
                                >
                                    <Link>
                                        <DeleteOutlined /> Delete
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
                onCell: (record: Item) => ({
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
                    className="site-page-header"
                    title={<T _str="Roles" />}
                    extra={[
                        <Button key="1" type="primary" onClick={this.toggleAdd}>
                            <T _str="New Role" />
                        </Button>,
                    ]}
                />

                <Modal
                    title={<T _str="New Role" />}
                    className="roles-modal"
                    centered
                    visible={isModalVisible}
                    onOk={this.handleAdd}
                    onCancel={this.cancelAdd}
                    footer={null}
                    width={600}
                >
                    <Form
                        layout="vertical"
                        ref={(form) => (this.addForm = form)}
                        initialValues={{ name: '' }}
                        hideRequiredMark
                        onFinish={this.handleAdd}
                        validateTrigger="onSubmit"
                    >
                        <Form.Item
                            label={<T _str="Name" />}
                            name="name"
                            {...('name' in errorsAdd && {
                                help: errorsAdd['name'],
                                validateStatus: 'error',
                            })}
                            rules={[
                                {
                                    required: true,
                                    message: <T _str="Name is required" />,
                                },
                            ]}
                        >
                            <Input placeholder="Name" />
                        </Form.Item>
                        <div className="ant-col ant-form-item-label">
                            <label>Permissions</label>
                        </div>
                        {Object.keys(allPrivileges).map((group) => (
                            <Card key={group} title={group} className="card-mb text-capitalize" type="inner">
                                <Form.Item name={group}>
                                    <Checkbox.Group>
                                        <Row gutter={[32, 16]}>
                                            {allPrivileges[group].map((action) => (
                                                <Col span={Object.keys(allPrivileges).length > 3 && 8} key={action}>
                                                    <Checkbox value={action} className="text-capitalize">
                                                        {action}
                                                    </Checkbox>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>
                            </Card>
                        ))}
                        <Form.Item className="modal-submit-btn button-container">
                            <Button type="text" className="cancel-btn prev" block onClick={this.cancelAdd}>
                                <T _str="Cancel" />
                            </Button>
                            <Button type="primary" htmlType="submit" block>
                                <T _str="Create" />
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <Paragraph className="labels-content">
                    <Table
                        className="hivelvet-table"
                        components={{
                            body: {
                                cell: this.EditableCell,
                                row: this.EditableRow,
                            },
                        }}
                        columns={mergedColumns}
                        dataSource={data}
                        pagination={pagination}
                        loading={loading}
                        onChange={this.handleTableChange}
                        expandable={{
                            expandedRowRender: this.expandedRowRender,
                            showExpandColumn: false,
                            expandedRowKeys: expandedKeys,
                        }}
                    />
                </Paragraph>
            </>
        );
    }
}

export default Roles;
