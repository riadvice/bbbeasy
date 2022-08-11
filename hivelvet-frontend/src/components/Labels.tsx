import React, { useEffect } from 'react';
import LabelsService from '../services/labels.service';
import { PaginationType } from '../types/PaginationType';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import { Alert, Badge, Button, Form, Input, Modal, PageHeader, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import _ from 'lodash';
import Highlighter from 'react-highlight-words/dist/main';
import Notifications from './Notifications';

const { Option} = Select;
const { Link } = Typography;

type Item = {
    key: number;
    name: string;
    description: string;
    color: string;
};

type formType = {
    name?: string;
    description?: string;
    color?: string;
};

interface EditableCellProps {
    editing: boolean;
    children: React.ReactNode;
    dataIndex: keyof Item;
    record: Item;
    inputType: 'text';
}

const EditableContext = React.createContext<FormInstance | null>(null);
const addForm: FormInstance = null;

const Labels = () => {
    const [data, setData] = React.useState<Item[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [pagination, setPagination] = React.useState<PaginationType>({ current: 1, pageSize: 5 });
    const [searchText, setSearchText] = React.useState<string>('');
    const [searchedColumn, setSearchedColumn] = React.useState<string>('');
    
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
            }).finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        //Runs only on the first render
        getLabels();
    }, []); 
    
    // search
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const handleSearch = (selectedKeys: string[], confirm, dataIndex: string, closed = false) => {
        if (closed) {
            confirm({ closeDropdown: false });
        }
        else {
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
            if (dataIndex == 'name' ) {
                text = text[0].toUpperCase() + text.slice(1);
            }
            if (searchedColumn === dataIndex) {
                return <Highlighter searchWords={[searchText]} autoEscape textToHighlight={text && text.toString()} />;
            }
            return text;
        },
    });
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
            render: (text, record) => {
                return (
                    <Space size="middle" className="table-actions">
                    <Link>
                        <EditOutlined /> <Trans i18nKey="edit" />
                    </Link>
                    <Popconfirm
                        title={t('delete_label_confirm')}
                        icon={<QuestionCircleOutlined className="red-icon" />}
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

    const EditableRow: React.FC = ({ ...props }) => <tr {...props} />;

    const EditableCell: React.FC<EditableCellProps> = ({
        editing,
        children,
        dataIndex,
        record,
        inputType,
        ...restProps
    }) => {

        return (
            <td {...restProps}>
                {(dataIndex == 'name' &&
                    <Badge
                      count={record.name}
                      style={{
                        backgroundColor: record.color,
                      }}
                    />) || children}
            </td>
        );
    };

    const mergedColumns = columns.map((col: any) => {
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
                editing: false,
            }),
        };
    });

    return (
        <> 
            <PageHeader 
            className='site-page-header'
            title={<Trans i18nKey="labels" />}
            extra={[
                <Button key="1" type="primary">
                    <Trans i18nKey="new_label" />
                </Button>,
            ]}
            />
            <Table
                className="hivelvet-table"
                components={{ 
                    body: {
                        row: EditableRow,
                        cell: EditableCell,
                    }
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