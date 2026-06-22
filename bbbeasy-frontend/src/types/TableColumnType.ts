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

import * as React from 'react';
import { ColumnFilterItem, FilterConfirmProps } from 'antd/lib/table/interface';

export interface FilterDropdownProps {
    setSelectedKeys: (selectedKeys: React.Key[]) => void;
    selectedKeys: React.Key[];
    confirm: (param?: FilterConfirmProps) => void;
    clearFilters?: () => void;
}

export type TableColumnType = {
    title: string;
    dataIndex: string;
    inputType?: string;
    editable?: boolean;
    width?: string;
    sorter?: { compare?: (a, b) => number; multiple?: number };
    render?: (text: string, record) => JSX.Element;
    filterDropdown?: (props: FilterDropdownProps) => JSX.Element;
    filterIcon?: (filtered: boolean) => JSX.Element;
    filters?: ColumnFilterItem[];
    onFilter?: (value: string | number | boolean, record) => any;
};
