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
import NotificationsService from "../services/notifications.service";
import PaginationType from './PaginationType';

import { PageHeader, Button, Row, Col, Typography, Table, Space, Modal, Popconfirm, Card } from 'antd';
import { Form, Input, Checkbox } from 'antd';
import {
    DeleteOutlined,
    SearchOutlined,
    QuestionCircleOutlined,
    UserOutlined,
    EditOutlined,
    KeyOutlined,
    WarningOutlined,
    CloseOutlined,
    CheckOutlined,
} from '@ant-design/icons';
import Highlighter from 'react-highlight-words/dist/main';
import { FormInstance } from 'antd/lib/form';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';

const { Paragraph, Link } = Typography;

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
    changedKeys?: number[];
    pagination?: PaginationType;
    loading?: boolean;

    allPrivileges?: {};

    errorsAdd?: [];
    isModalVisible?: boolean;

    searchText?: string;
    searchedColumn?: string;
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
            changedKeys: [],
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
    getPermissionsCard = (key?: React.Key) => {
        const allPrivileges = this.state.allPrivileges;
        return (
            <div className="bordered-card">
                {Object.keys(allPrivileges).map((group) => {
                    const newGroup = group.replace('_', ' ');
                    return (
                        <Card
                            bordered={false}
                            key={group}
                            title={newGroup}
                            className="text-capitalize"
                            type="inner"
                        >
                            <Form.Item name={group}>
                                <Checkbox.Group disabled={key == 1 && true}>
                                    <Row gutter={[32, 16]}>
                                        {allPrivileges[group].map((action) => (
                                            <Col key={action}>
                                                <Checkbox value={action} className="text-capitalize">
                                                    {action}
                                                </Checkbox>
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
    }

    //add
    addForm = null;
    handleAdd = (formValues: any) => {
        this.setState({ errorsAdd: [] });
        const name = formValues.name;
        delete formValues.name;
        RolesService.add_role({ name: name, permissions: formValues })
            .then((response) => {
                this.setState({
                    loading: true,
                    isModalVisible: false,
                });
                const result = response.data;
                const newRowData: Item = result.role;
                NotificationsService.openNotificationWithIcon('success', t('add_role_success'));
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
    failedAdd = () => {
        this.setState({ errorsAdd: [] });
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
        const newRowData = response.data.role;
        NotificationsService.openNotificationWithIcon('success', t('edit_role_success'));
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
    expandedRowRender = (record) => {
        let editRowForm = null;
        const permissionsChecked = record.permissions;

        const cancelEdit = (key: React.Key) => {
            editRowForm?.resetFields();
            this.setState({
                expandedKeys: this.state.expandedKeys.filter((item) => item !== key),
            });
        };
        const saveEdit = (formValues, key) => {
            let keys = [...this.state.changedKeys];
            if (keys.includes(key)) {
                keys = keys.filter((item) => item !== key);
                this.setState({ changedKeys: keys });
            }
            RolesService.edit_role({ permissions: formValues }, record.key)
                .then((response) => {
                    this.editRow(response, record.key);
                    this.setState({
                        expandedKeys: this.state.expandedKeys.filter((item) => item !== record.key),
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        };
        const changeEdit = (key) => {
            const keys = [...this.state.changedKeys];
            if (!keys.includes(key)) {
                keys.push(key);
                this.setState({ changedKeys: keys });
            }
        };

        return (
            <Form
                ref={(form) => (editRowForm = form)}
                initialValues={permissionsChecked}
                onFinish={(values) => saveEdit(values, record.key)}
                onChange={() => changeEdit(record.key)}
            >
                <Card bordered={false} className="card-parent">
                    {this.getPermissionsCard(record.key)}
                    {record.key != 1 && (
                        <Space size="middle" className="actions-expanded">
                            {this.state.changedKeys.includes(record.key) ? (
                                <Popconfirm
                                    title={t('cancel_edit')}
                                    placement="leftTop"
                                    onConfirm={() => cancelEdit(record.key)}
                                >
                                    <Button size="middle">
                                        <Trans i18nKey="cancel" />
                                    </Button>
                                </Popconfirm>
                            ) : (
                                <Button size="middle" onClick={() => cancelEdit(record.key)}>
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
        );
    };

    // edit name
    EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
        const [editForm] = Form.useForm();
        return (
            <Form
                size="middle"
                form={editForm}
                component={false}
                validateTrigger="onSubmit"
            >
                <EditableContext.Provider value={editForm}>
                    <tr {...props} />
                </EditableContext.Provider>
            </Form>
        );
    };
    EditableCell: React.FC<EditableCellProps> = ({ title, editable, children, dataIndex, record, ...restProps }) => {
        const [isShown, setIsShown] = useState(false);
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
            if (dataIndex == 'name') {
                let nameText = record[dataIndex];
                nameText = nameText.replace('_', ' ');
                nameText = nameText[0].toUpperCase() + nameText.slice(1);
                editForm.setFieldsValue({ [dataIndex]: nameText });
            } else {
                editForm.setFieldsValue({ [dataIndex]: record[dataIndex] });
            }
        };
        const cancelName = () => {
            setErrorsEdit({});
            setEditing(!editing);
        };
        const saveName = async () => {
            setErrorsEdit({});
            try {
                const values = (await editForm.validateFields()) as Item;
                const key = record.key;
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
            <td {...restProps} onMouseOver={() => setIsShown(true)} onMouseLeave={() => setIsShown(false)}>
                {editable ? (
                    editing ? (
                        <Form.Item
                            name={dataIndex}
                            className="input-editable"
                            {...(dataIndex in errorsEdit &&
                                record.key == errorsEdit['key'] && {
                                    help: <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsEdit[dataIndex])} />,
                                    validateStatus: 'error',
                                })
                            }
                            rules={[
                                {
                                    required: true,
                                    message: t('required_'+dataIndex)
                                },
                            ]}
                        >
                            <Input
                                ref={inputRef}
                                onPressEnter={saveName}
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
                                            onClick={saveName}
                                            type="primary"
                                            className="cell-input-save"
                                        />
                                    </>
                                }
                            />
                        </Form.Item>
                    ) : (
                        <>
                            {children}
                            {isShown && (
                                <Button
                                    size="small"
                                    type="link"
                                    icon={<EditOutlined className="cell-edit-icon" />}
                                    onClick={toggleEditName}
                                />
                            )}
                        </>
                    )
                ) : (
                    children
                )}
            </td>
        );
    };

    // delete
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
                // delete item of this page
                this.setState({
                    data: newData.filter((item) => item.key !== key),
                    loading: false,
                });
                NotificationsService.openNotificationWithIcon('success', t('delete_role_success'));
            })
            .catch((error) => {
                console.log(error);
            });
    };
    handleDelete = (key: React.Key, nbUsers) => {
        if (nbUsers > 0) {
            Modal.confirm({
                wrapClassName: 'delete-wrap',
                title: undefined,
                icon: undefined,
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
                onOk: () => this.deleteRole(key, nbUsers),
            });
        } else {
            this.deleteRole(key, nbUsers);
        }
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
        const { data, pagination, loading, isModalVisible, errorsAdd, expandedKeys } = this.state;

        const columns = [
            {
                title: t('name_col'),
                dataIndex: 'name',
                editable: true,
                width: '35%',
                ...this.getColumnSearchProps('name'),
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
                editable: false,
                render: (text, record) => {
                    return (
                        <Space
                            size="middle"
                            className={expandedKeys.includes(record.key) ? 'table-actions editable' : 'table-actions'}
                        >
                            <Link onClick={() => this.toggleEdit(record.key)}>
                                <KeyOutlined /> <Trans i18nKey="permissions.label" />
                            </Link>
                            {record.key != 1 && record.key != 2 && (
                                <Popconfirm
                                    title={t('delete_role_confirm')}
                                    icon={<QuestionCircleOutlined className="red-icon" />}
                                    onConfirm={() => this.handleDelete(record.key, record.users)}
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
                    title={<Trans i18nKey="roles" />}
                    extra={[
                        <Button key="1" type="primary" onClick={this.toggleAdd}>
                            <Trans i18nKey="new_role" />
                        </Button>,
                    ]}
                />

                <Modal
                    title={<Trans i18nKey="new_role" />}
                    className="add-modal"
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
                        onFinishFailed={this.failedAdd}
                        validateTrigger="onSubmit"
                    >
                        <Form.Item
                            label={<Trans i18nKey="name.label" />}
                            name="name"
                            {...('name' in errorsAdd && {
                                help: <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsAdd['name'])} />,
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
                        {this.getPermissionsCard()}
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

                <Paragraph>
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

export default withTranslation()(Roles);
