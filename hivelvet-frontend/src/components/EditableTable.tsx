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

import React from 'react';

import { Table } from 'antd';
import EditableTableRow from './EditableTableRow';
import { FormInstance } from 'antd/lib/form';

import { PaginationType } from '../types/PaginationType';
import { TableColumnType } from '../types/TableColumnType';
import { UserType } from '../types/UserType';
import { RecordingType } from '../types/RecordingType';
import { LabelType } from '../types/LabelType';
import { RoleType } from '../types/RoleType';

type Props = {
    EditableCell: React.FC;
    editForm: FormInstance;
    EditableContext?: React.Context<FormInstance>;
    mergedColumns: TableColumnType[];
    dataSource: RecordingType[] | LabelType[] | UserType[] | RoleType[];

    loading: boolean;
    expandableTable?: object;
};

export const EditableTable = (props: Props) => {
    const { EditableCell, editForm, EditableContext, mergedColumns, dataSource, loading, expandableTable } = props;
    const [pagination, setPagination] = React.useState<PaginationType>({ current: 1, pageSize: 5 });

    return (
        <Table
            className="hivelvet-table"
            components={{
                body: {
                    cell: EditableCell,
                    row: ({ ...props }) => {
                        return <EditableTableRow editForm={editForm} editContext={EditableContext} {...props} />;
                    },
                },
            }}
            columns={mergedColumns}
            dataSource={dataSource}
            pagination={pagination}
            loading={loading}
            onChange={(newPagination: PaginationType) => setPagination(newPagination)}
            expandable={expandableTable}
        />
    );
};
