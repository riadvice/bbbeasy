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

import React from 'react';
import { Trans } from 'react-i18next';
import EN_US from '../locale/en-US.json';
import { t } from 'i18next';

import { Form, Space } from 'antd';

import { RecordingType } from '../types/RecordingType';
import { UserType } from '../types/UserType';
import { RoleType } from '../types/RoleType';
import { LabelType } from '../types/LabelType';

type Props = {
    componentName: string;
    editing: boolean;
    children: React.ReactNode;
    dataIndex: string;
    record: RecordingType | LabelType | UserType | RoleType;
    inputNode: JSX.Element;
    errorsEdit: object;
    editRules?: object;

    editable?: boolean;
    editComponent?: React.ReactNode;
    mouseOverFct?: () => void;
    mouseLeaveFct?: () => void;

    showLabelColor?: boolean;
    inputColor?: JSX.Element;
};

const EditableTableCell: React.FC<Props> = ({
    componentName,
    editing,
    children,
    dataIndex,
    record,
    inputNode,
    errorsEdit,
    editRules,
    editable,
    editComponent,
    mouseOverFct,
    mouseLeaveFct,
    showLabelColor,
    inputColor,
    ...restProps
}) => {
    let firstTest = false;
    let secondTest = false;

    if (editable != undefined) {
        if (editing) {
            firstTest = true;
        } else {
            secondTest = true;
        }
    } else {
        if (editing) {
            firstTest = true;
        }
    }

    const customFormItem = (index: string, customInputNode: JSX.Element) => {
        if (componentName == 'Labels' && index == 'name') {
            return (
                <Form.Item
                    name={index}
                    className="input-editable"
                    {...(index in errorsEdit &&
                        record.key == errorsEdit['key'] && {
                            help: (
                                <Trans
                                    i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsEdit[index])}
                                />
                            ),
                            validateStatus: 'error',
                        })}
                    rules={[
                        {
                            required: true,
                            message: t('required_' + index),
                        },
                        { ...editRules },
                        {
                            min: 1,
                            message: <Trans i18nKey="label_name.size" />,
                        },
                        {
                            max: 32,
                            message: <Trans i18nKey="label_name.maxSize" />,
                        },
                    ]}
                >
                    {customInputNode}
                </Form.Item>
            );
        } else {
            return (
                <Form.Item
                    name={index}
                    className="input-editable"
                    {...(index in errorsEdit &&
                        record.key == errorsEdit['key'] && {
                            help: (
                                <Trans
                                    i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsEdit[index])}
                                />
                            ),
                            validateStatus: 'error',
                        })}
                >
                    {customInputNode}
                </Form.Item>
            );
        }
    };

    return (
        <td {...restProps} onMouseOver={mouseOverFct} onMouseLeave={mouseLeaveFct}>
            {firstTest ? (
                <Space size="middle">
                    {customFormItem(dataIndex, inputNode)}
                    {showLabelColor && customFormItem('color', inputColor)}
                </Space>
            ) : secondTest ? (
                <>
                    {children}
                    {editComponent}
                </>
            ) : (
                children
            )}
        </td>
    );
};

export default EditableTableCell;
