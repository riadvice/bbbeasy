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
import EN_US from '../locale/en-US.json';
import LabelsService from '../services/labels.service';
import { PaginationType } from '../types/PaginationType';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import { Badge, Button, Form, Input, PageHeader, Popconfirm, Space, Table, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import _ from 'lodash';
import Highlighter from 'react-highlight-words/dist/main';
import Notifications from './Notifications';
import AddLabelForm from './AddLabelForm';
import InputColor from './layout/InputColor';
import { DataContext } from 'lib/RoomsContext';

const { Link } = Typography;

type Item = {
    key: number;
    name: string;
    description: string;
    color: string;
};

interface EditableCellProps {
    editing: boolean;
    children: React.ReactNode;
    dataIndex: keyof Item;
    record: Item;
    inputType: 'text';
}

const EditableContext = React.createContext<FormInstance | null>(null);

const Labels = () => {
    const dataContext = React.useContext(DataContext);
    const [data, setData] = React.useState<Item[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [editingKey, setEditingKey] = React.useState<number>(null);
    const [errorsEdit, setErrorsEdit] = React.useState({});
    const [cancelVisibility, setCancelVisibility] = React.useState<boolean>(false);
    const [pagination, setPagination] = React.useState<PaginationType>({ current: 1, pageSize: 5 });
    const [searchText, setSearchText] = React.useState<string>('');
    const [searchedColumn, setSearchedColumn] = React.useState<string>('');

    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);

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
    }, []);
    // add

    //delete
    const handleDelete = (key: number) => {
        setLoading(true);
        LabelsService.delete_label(key)
            .then(() => {
                Notifications.openNotificationWithIcon('success', t('delete_label_success'));
                setData((labels) => labels.filter((label) => label.key !== key));
                const indexlabel = dataContext.dataLabels.findIndex((item) => key === item.key);
                if (indexlabel !== -1) {
                    dataContext.dataLabels.splice(indexlabel, 1);
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
    // search
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const handleSearch = (selectedKeys: string[], confirm, dataIndex: string, closed = false) => {
        if (closed) {
            confirm({ closeDropdown: false });
        } else {
            confirm();
        }

        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const getColumnSearchProps = (dataIndex: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div className="table-search-bloc">
                <Input
                    size="middle"
                    className="table-search-input"
                    placeholder={t('search') + ' ' + t(dataIndex + '_col')}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys([e.target.value])}
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
        filterIcon: (filtered: boolean) => <SearchOutlined className={filtered && 'search-icon-filtered'} />,
        onFilter: (value, record: Item) => {
            return record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '';
        },
        render: (text) => {
            if (dataIndex == 'name') {
                text = text[0].toUpperCase() + text.slice(1);
            }
            if (searchedColumn === dataIndex) {
                return <Highlighter searchWords={[searchText]} autoEscape textToHighlight={text && text.toString()} />;
            }
            return text;
        },
    });
    //edit
    const [editForm] = Form.useForm();
    const EditableRow: React.FC = ({ ...props }) => {
        return (
            <Form size="middle" form={editForm} component={false} validateTrigger="onSubmit">
                <EditableContext.Provider value={editForm}>
                    <tr {...props} />
                </EditableContext.Provider>
            </Form>
        );
    };

    const EditableCell: React.FC<EditableCellProps> = ({ editing, children, dataIndex, record, ...restProps }) => {
        const EditableCol = (
            <Space size="middle">
                {dataIndex != 'description' ? (
                    <Form.Item
                        name={dataIndex}
                        className="input-editable editable-row"
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
                        <Input
                            onFocus={() => {
                                setCancelVisibility(false);
                            }}
                        />
                    </Form.Item>
                ) : (
                    <>
                        <Form.Item
                            name="description"
                            className="input-editable editable-row"
                            {...('description' in errorsEdit &&
                                record.key == errorsEdit['key'] && {
                                    help: (
                                        <Trans
                                            i18nKey={Object.keys(EN_US).filter(
                                                (elem) => EN_US[elem] == errorsEdit['description']
                                            )}
                                        />
                                    ),
                                    validateStatus: 'error',
                                })}
                        >
                            <Input
                                onFocus={() => {
                                    setCancelVisibility(false);
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="color"
                            className="input-editable editable-row"
                            {...('color' in errorsEdit &&
                                record.key == errorsEdit['key'] && {
                                    help: (
                                        <Trans
                                            i18nKey={Object.keys(EN_US).filter(
                                                (elem) => EN_US[elem] == errorsEdit['color']
                                            )}
                                        />
                                    ),
                                    validateStatus: 'error',
                                })}
                            rules={[
                                {
                                    required: true,
                                    message: t('required_color'),
                                },
                            ]}
                        >
                            <InputColor
                                defaultColor={record.color}
                                onFocus={() => {
                                    setCancelVisibility(false);
                                }}
                            />
                        </Form.Item>
                    </>
                )}
            </Space>
        );
        const RegularCol =
            dataIndex == 'name' ? (
                <Badge
                    count={record.name}
                    style={{
                        backgroundColor: record.color,
                    }}
                />
            ) : (
                children
            );
        return <td {...restProps}>{editing ? EditableCol : RegularCol}</td>;
    };

    const isEditing = (record: Item) => record.key == editingKey;
    const toggleEdit = (record: Item) => {
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

    const compareEdit = (oldRecord: Item, newRecord: object): boolean => _.isEqual(oldRecord, newRecord);

    const saveEdit = async (record: Item, key: number) => {
        try {
            const formValues: object = await editForm.validateFields();
            if (!compareEdit(record, editForm.getFieldsValue(true))) {
                setLoading(true);
                setErrorsEdit({});
                LabelsService.edit_label(formValues, key)
                    .then((response) => {
                        const newRow: Item = response.data.label;
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
                cancelEdit();
            }
        } catch (errInfo) {
            console.error('Save failed:', errInfo);
        }
    };

    const columns = [
        {
            title: t('labels_cols.name'),
            dataIndex: 'name',
            inputType: 'text',
            editable: true,
            ...getColumnSearchProps('name'),
            width: '20%',
            sorter: {
                compare: (a, b) => a.name.localeCompare(b.name),
                multiple: 2,
            },
        },
        {
            title: t('labels_cols.description'),
            dataIndex: 'description',
            inputType: 'text',
            editable: true,
            ...getColumnSearchProps('description'),
            width: '40%',
            sorter: {
                compare: (a, b) => a.name.localeCompare(b.name),
                multiple: 1,
            },
        },
        {
            title: t('actions_col'),
            dataIndex: 'actions',
            editable: false,
            render: (text, record) => {
                const handleCancelVisibilityChange = () => {
                    compareEdit(record, editForm.getFieldsValue(true)) ? cancelEdit() : setCancelVisibility(true);
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
                            <Button size="middle">
                                <Trans i18nKey="cancel" />
                            </Button>
                        </Popconfirm>
                        <Button
                            disabled={loading}
                            size="middle"
                            type="primary"
                            onClick={() => saveEdit(record, record.key)}
                        >
                            <Trans i18nKey="save" />
                        </Button>
                    </Space>
                );
                const Actions = (
                    <Space size="middle" className="table-actions">
                        <Link disabled={editingKey !== null} onClick={() => toggleEdit(record)}>
                            <EditOutlined /> <Trans i18nKey="edit" />
                        </Link>
                        <Popconfirm
                            title={t('delete_label_confirm')}
                            icon={<QuestionCircleOutlined className="red-icon" />}
                            onConfirm={() => handleDelete(record.key)}
                        >
                            <Link>
                                <DeleteOutlined /> <Trans i18nKey="delete" />
                            </Link>
                        </Popconfirm>
                    </Space>
                );

                const editable = isEditing(record);
                return editable ? EditActions : Actions;
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
                className="site-page-header"
                title={<Trans i18nKey="labels" />}
                extra={[
                    <Button key="1" type="primary" onClick={() => setIsModalVisible(true)}>
                        <Trans i18nKey="new_label" />
                    </Button>,
                ]}
            />

            <AddLabelForm
                defaultColor="#fbbc0b"
                isModalShow={isModalVisible}
                close={() => {
                    setIsModalVisible(false);
                }}
            />

            <Table
                className="hivelvet-table"
                components={{
                    body: {
                        row: EditableRow,
                        cell: EditableCell,
                    },
                }}
                columns={mergedColumns}
                dataSource={data}
                pagination={pagination}
                loading={loading}
                onChange={(newPagination: PaginationType) => setPagination(newPagination)}
            />
        </>
    );
};
export default withTranslation()(Labels);
