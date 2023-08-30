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
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';
import type { Color } from 'antd/es/color-picker';
import { Button, Form, Input, Modal, ColorPicker, Space, theme } from 'antd';

import { DataContext } from 'lib/RoomsContext';
import Notifications from './Notifications';

import LabelsService from 'services/labels.service';

import { FormInstance } from 'antd/lib/form';
import { LabelType } from '../types/LabelType';

type Props = {
    isLogin?: boolean;
    errors?: string[];
    defaultColor: string;
    isModalShow: boolean;
    close: () => void;
};
type formType = {
    name?: string;
    description?: string;
    color?: string;
};
let addForm: FormInstance = null;

export const AddLabelForm = (props: Props) => {
    const [initialColor, setInitialColor] = React.useState<string>('#fbbc0b');
    const { defaultColor } = props;
    const initialAddValues: formType = {
        name: '',
        description: '',
        color: initialColor,
    };
    const [color, setColor] = React.useState<string>(defaultColor ? defaultColor : initialColor);
    const dataContext = React.useContext(DataContext);
    const [data, setData] = React.useState<LabelType[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [errorsAdd, setErrorsAdd] = React.useState<string[]>([]);
    const { token } = theme.useToken();
    const handleAdd = (values) => {
        const formValues: formType = values;

        setErrorsAdd([]);
        setLoading(true);
        LabelsService.add_label(formValues)
            .then((response) => {
                Notifications.openNotificationWithIcon('success', t('add_label_success'));
                props.close();
                const newRowData: LabelType = response.data.label;

                //delete data of form
                addForm?.resetFields();
                //add data to table
                setData((data) => [...data, newRowData]);
                dataContext.setDataLabels([...dataContext.dataLabels, newRowData]);
            })
            .catch((error) => {
                const responseData = error.response.data;
                if (responseData.errors) {
                    setErrorsAdd(responseData.errors);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };
    const cancelAdd = () => {
        props.close();
        addForm?.resetFields();
        setColor(initialColor);
    };

    const failedAdd = () => {
        setErrorsAdd([]);
    };
    return (
        <>
            <Modal
                title={<Trans i18nKey="new_label" />}
                className="add-modal"
                centered
                open={props.isModalShow}
                onOk={handleAdd}
                onCancel={cancelAdd}
                footer={null}
                maskClosable={true}
            >
                <Form
                    layout="vertical"
                    ref={(form) => (addForm = form)}
                    initialValues={initialAddValues}
                    hideRequiredMark
                    onFinish={handleAdd}
                    onFinishFailed={failedAdd}
                    validateTrigger="onSubmit"
                >
                    {!props.isLogin && (
                        <Form.Item
                            label={<Trans i18nKey="name.label" />}
                            name="name"
                            {...('name' in errorsAdd && {
                                help: (
                                    <Trans
                                        i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsAdd['name'])}
                                    />
                                ),
                                validateStatus: 'error',
                            })}
                            rules={[
                                {
                                    required: true,
                                    message: <Trans i18nKey="name.required" />,
                                },
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
                            <Input placeholder={t('name.label')} />
                        </Form.Item>
                    )}
                    <Form.Item label={<Trans i18nKey="description.label" />} name="description">
                        <Input placeholder={t('description.label')} />
                    </Form.Item>
                    <Form.Item
                        label={<Trans i18nKey="color.label" />}
                        name="color"
                        {...('color' in errorsAdd && {
                            help: (
                                <Trans
                                    i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsAdd['color'])}
                                />
                            ),
                            validateStatus: 'error',
                        })}
                    >
                        <ColorPicker
                            value={color}
                            onChange={(color1: Color) => {
                                addForm.setFieldValue('color', color1.toHexString());

                                setColor(color1.toHexString());
                            }}
                        >
                            <Space className="space-color-picker-add-label">
                                <div
                                    style={{
                                        width: token.sizeMD,
                                        height: token.sizeMD,
                                        borderRadius: token.borderRadiusSM,
                                        backgroundColor: color,
                                    }}
                                />
                                <span>{color}</span>
                            </Space>
                        </ColorPicker>
                    </Form.Item>
                    <Form.Item className="modal-submit-btn button-container">
                        <Button type="text" className="cancel-btn prev" block onClick={cancelAdd}>
                            <Trans i18nKey="cancel" />
                        </Button>
                        <Button type="primary" htmlType="submit" disabled={loading} block>
                            <Trans i18nKey="create" />
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
export default withTranslation()(AddLabelForm);
