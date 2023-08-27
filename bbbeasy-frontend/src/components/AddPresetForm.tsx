/**
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBEasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';

import { Button, Form, Input, Modal } from 'antd';
import { DataContext } from 'lib/RoomsContext';
import Notifications from './Notifications';

import PresetsService from 'services/presets.service';
import AuthService from 'services/auth.service';

import { MyPresetType } from 'types/MyPresetType';
import { FormInstance } from 'antd/lib/form';

type Props = {
    isLogin?: boolean;
    errors?: string[];

    isModalShow: boolean;
    close: () => void;
};
type formType = {
    name?: string;
};

let addForm: FormInstance = null;

export const AddPresetForm = (props: Props) => {
    const dataContext = React.useContext(DataContext);
    const initialAddValues: formType = {
        name: '',
    };
    const [myPresets, setMyPresets] = React.useState<MyPresetType[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [errorsAdd, setErrorsAdd] = React.useState<string[]>([]);

    const handleAdd = (values) => {
        const formValues: formType = values;
        setErrorsAdd([]);
        setLoading(true);

        PresetsService.add_preset(formValues, AuthService.getCurrentUser().id)
            .then((response) => {
                const newPreset: MyPresetType = response.data.preset;
                Notifications.openNotificationWithIcon('success', t('add_preset_success'));

                addForm?.resetFields();
                setMyPresets([...myPresets, newPreset]);
                dataContext.setDataPresets([...dataContext.dataPresets, newPreset]);
                props.close();
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
    };

    const failedAdd = () => {
        setErrorsAdd([]);
    };
    return (
        <>
            <Modal
                title={<Trans i18nKey="new_preset" />}
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
                                max: 64,
                                message: <Trans i18nKey="preset_name.maxSize" />,
                            },
                        ]}
                    >
                        <Input placeholder={t('name.label')} />
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
export default withTranslation()(AddPresetForm);
