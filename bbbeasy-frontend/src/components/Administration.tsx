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

import React, { useEffect } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';
import LoadingSpinner from './LoadingSpinner';
import { PageHeader } from '@ant-design/pro-layout';

import { Form, Switch, Col, Row } from 'antd';

import { Alert, Button } from 'antd';

import settingsService from 'services/settings.service';
import { SettingsType } from 'types/SettingsType';
import Notifications from './Notifications';
import { CompareRecords } from 'functions/compare.function';

export const Administration = () => {
    const [successful, setSuccessful] = React.useState<boolean>(false);
    const [settings, setSettings] = React.useState<SettingsType>(null);
    const [message, setMessage] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    type formType = {
        send_registration: boolean;
        self_registration: boolean;
    };
    const [settingsForm] = Form.useForm();

    const initialValues: formType = {
        send_registration: false,
        self_registration: false,
    };

    useEffect(() => {
        settingsService
            .collect_settings()
            .then((response) => {
                const settings: SettingsType = response.data;
                if (settings) {
                    settingsForm.setFieldsValue({
                        company_name: settings.company_name,
                        company_url: settings.company_website,
                        platform_name: settings.platform_name,
                        term_url: settings.terms_use,
                        policy_url: settings.privacy_policy,
                        logo: settings.logo,
                        send_registration: settings.send_registration,
                        self_registration: settings.self_registration,
                        theme: {
                            brand_color: settings.brand_color,
                            default_font_size: settings.default_font_size,
                            border_radius: settings.border_radius,
                            wireframe_style: settings.wireframe_style,
                        },
                    });

                    setSettings(settings);
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const onFinish = () => {
        const settingsData: formType = settingsForm.getFieldsValue(true);

        settingsService
            .edit_settings(settingsData)
            .then((response) => {
                const newSettings: SettingsType = response.data.settings;
                if (!CompareRecords(settings, newSettings)) {
                    setSettings(newSettings);
                    Notifications.openNotificationWithIcon('success', t('edit_administration_settings_success'));
                } else {
                    Notifications.openNotificationWithIcon('info', t('no_changes'));
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };
    return isLoading ? (
        <LoadingSpinner className="loading" />
    ) : (
        <>
            <PageHeader className="site-page-header" title={<Trans i18nKey="administration" />} />

            <Row className="branding-row">
                <Col span={8}>
                    <Form
                        layout="horizontal"
                        name="administration_form"
                        className="administration_form"
                        form={settingsForm}
                        initialValues={initialValues}
                        requiredMark={false}
                        scrollToFirstError={true}
                        validateTrigger="onSubmit"
                        onFinish={onFinish}
                        onValuesChange={() => setMessage('')}
                    >
                        <div className="step1">
                            {message && successful && (
                                <Alert
                                    type="error"
                                    className="text-center"
                                    message={
                                        <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == message)} />
                                    }
                                    showIcon
                                />
                            )}

                            <Form.Item
                                label={<Trans i18nKey="send_invitation.label" />}
                                name="send_registration"
                                valuePropName="checked"
                                initialValue={settings ? settings.send_registration : false}
                            >
                                <Switch defaultChecked={settings ? settings.send_registration : false} />
                            </Form.Item>

                            <Form.Item
                                className="switch-item"
                                label={<Trans i18nKey="self_registration.label" />}
                                name="self_registration"
                                valuePropName="checked"
                                initialValue={settings ? settings.self_registration : false}
                            >
                                <Switch
                                    className="switch"
                                    defaultChecked={settings ? settings.self_registration : false}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" id="submit-btn" htmlType="submit" block>
                                    <Trans i18nKey="save" />
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                </Col>
            </Row>
        </>
    );
};

export default withTranslation()(Administration);
