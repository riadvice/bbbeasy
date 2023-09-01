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

import React, { useEffect, useState } from 'react';

import SettingsService from '../services/settings.service';

import { Button, Col, Form, Row } from 'antd';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';

import { Step2Form } from './Step2Form';
import Notifications from './Notifications';
import { CompareRecords } from '../functions/compare.function';
import LoadingSpinner from './LoadingSpinner';

import axios from 'axios';
import { apiRoutes } from '../routing/backend-config';
import AuthService from '../services/auth.service';

import { UploadFile } from 'antd/lib/upload/interface';
import { SettingsType } from '../types/SettingsType';
import { ThemeType } from '../types/ThemeType';

type formType = {
    company_name: string;
    company_url: string;
    platform_name: string;
    term_url: string;
    policy_url: string;
    theme: ThemeType;
    logo: string;
};

const Branding = () => {
    const [settingsForm] = Form.useForm();
    const [data, setData] = React.useState<SettingsType>(null);
    const [actions, setActions] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [brandColor, setBrandColor] = React.useState<string>('');
    const [defaultFontSize, setDefaultFontSize] = React.useState<number>(0);
    const [borderRadius, setBorderRadius] = React.useState<number>(0);
    const [wireframeStyle, setWireframeStyle] = React.useState<boolean>(false);
    const [file, setFile] = React.useState<UploadFile>(null);
    const [fileList, setFileList] = React.useState<UploadFile[]>(null);

    const setSettings = (settings: SettingsType) => {
        setBrandColor(settings.brand_color);
        setDefaultFontSize(settings.default_font_size);
        setBorderRadius(settings.border_radius);
        setWireframeStyle(settings.wireframe_style);
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
        if (settings.logo != null) {
            const settingLogo: UploadFile = {
                uid: '1',
                name: settings.logo,
                status: 'done',
            };
            setFileList([settingLogo]);
            setFile(settingLogo);
            console.log(settingLogo);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        SettingsService.collect_settings()
            .then((response) => {
                const settings: SettingsType = response.data;
                if (settings) {
                    setData(settings);
                    setSettings(settings);
                }
            })
            .catch((error) => {
                console.log(error);
            });

        const settingsActions = AuthService.getActionsPermissionsByGroup('settings');
        setActions(settingsActions);
    }, []);

    const onFinish = () => {
        const settingsData: formType = settingsForm.getFieldsValue(true);

        //update branding colors
        settingsData.theme = {
            brand_color: brandColor,
            default_font_size: defaultFontSize,
            border_radius: borderRadius,
            wireframe_style: wireframeStyle,
        };
        let updateLogo = false;
        let deleteLogo = false;
        //edit file

        if (file != undefined && file.originFileObj != null) {
            const formData: FormData = new FormData();
            formData.append('logo', file.originFileObj, file.name);
            formData.append('logo_name', file.name);
            updateLogo = true;

            axios
                .post(apiRoutes.SAVE_FILE_URL, formData)
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else if (file == undefined && settingsData.logo != null) {
            deleteLogo = true;
        }

        //update logo
        if (updateLogo) {
            console.log(updateLogo);
            settingsData.logo = file.name;
        } else if (deleteLogo) {
            settingsData.logo = null;
        }

        //edit settings
        SettingsService.edit_settings(settingsData)
            .then((response) => {
                console.log(response);

                const newData: SettingsType = response.data.settings;

                if (!CompareRecords(data, newData)) {
                    Notifications.openNotificationWithIcon('success', t('edit_settings_success'));
                    setSettings(newData);
                } else {
                    Notifications.openNotificationWithIcon('info', t('no_changes'));
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <Row justify="center" className="branding-row">
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <Col span={18}>
                    <fieldset disabled={!AuthService.isAllowedAction(actions, 'edit')}>
                        <Form
                            layout="vertical"
                            className="install-form"
                            form={settingsForm}
                            requiredMark={false}
                            scrollToFirstError={true}
                            validateTrigger="onSubmit"
                            onFinish={onFinish}
                        >
                            <Step2Form
                                brandColor={brandColor}
                                defaultFontSize={defaultFontSize}
                                borderRadius={borderRadius}
                                wireframeStyle={wireframeStyle}
                                setBrandColor={setBrandColor}
                                setDefaultFontSize={setDefaultFontSize}
                                setBorderRadius={setBorderRadius}
                                setWireframeStyle={setWireframeStyle}
                                setFile={setFile}
                                fileList={fileList}
                                setFileList={setFileList}
                            />

                            {AuthService.isAllowedAction(actions, 'edit') && (
                                <Form.Item className="button-container button-padding">
                                    <Button type="primary" id="submit-btn" htmlType="submit" block>
                                        <Trans i18nKey={'edit'} />
                                    </Button>
                                </Form.Item>
                            )}
                        </Form>
                    </fieldset>
                </Col>
            )}
        </Row>
    );
};

export default withTranslation()(Branding);
