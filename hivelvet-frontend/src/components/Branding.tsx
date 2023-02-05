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
import { BrandingColorsType } from '../types/BrandingColorsType';

type formType = {
    company_name: string;
    company_url: string;
    platform_name: string;
    term_url: string;
    policy_url: string;
    branding_colors: BrandingColorsType;
    logo: string;
};

const Branding = () => {
    const [settingsForm] = Form.useForm();
    const [data, setData] = React.useState<formType>(null);
    const [actions, setActions] = React.useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [primaryColor, setPrimaryColor] = React.useState<string>('');
    const [secondaryColor, setSecondaryColor] = React.useState<string>('');
    const [accentColor, setAccentColor] = React.useState<string>('');
    const [addColor, setAddColor] = React.useState<string>('');
    const [file, setFile] = React.useState<UploadFile>(null);
    const [fileList, setFileList] = React.useState<UploadFile[]>(null);

    const setSettings = (settings: SettingsType) => {
        setPrimaryColor(settings.primary_color);
        setSecondaryColor(settings.secondary_color);
        setAccentColor(settings.accent_color);
        setAddColor(settings.additional_color);
        settingsForm.setFieldsValue({
            company_name: settings.company_name,
            company_url: settings.company_website,
            platform_name: settings.platform_name,
            term_url: settings.terms_use,
            policy_url: settings.privacy_policy,
            logo: settings.logo,
            branding_colors: {
                primary_color: settings.primary_color,
                secondary_color: settings.secondary_color,
                accent_color: settings.accent_color,
                add_color: settings.additional_color,
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
        }
        setIsLoading(false);
        setData(settingsForm.getFieldsValue(true));
    };

    useEffect(() => {
        SettingsService.collect_settings()
            .then((response) => {
                const settings: SettingsType = response.data;
                if (settings) {
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
        settingsData.branding_colors = {
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            accent_color: accentColor,
            add_color: addColor,
        };
        let updateLogo = false;
        let deleteLogo = false;
        //edit file
        if (file != undefined && file.originFileObj != null) {
            const formData: FormData = new FormData();
            formData.append('logo', file.originFileObj, file.originFileObj.name);
            formData.append('logo_name', file.originFileObj.name);
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

        if (!CompareRecords(data, settingsData) || updateLogo || deleteLogo) {
            //update logo
            if (updateLogo) {
                settingsData.logo = file.name;
            } else if (deleteLogo) {
                settingsData.logo = null;
            }

            //edit settings
            SettingsService.edit_settings(settingsData)
                .then((response) => {
                    const newData: SettingsType = response.data.settings;
                    if (newData) {
                        Notifications.openNotificationWithIcon('success', t('edit_settings_success'));
                        setSettings(newData);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            Notifications.openNotificationWithIcon('info', t('no_changes'));
        }
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
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                accentColor={accentColor}
                                addColor={addColor}
                                setPrimaryColor={setPrimaryColor}
                                setSecondaryColor={setSecondaryColor}
                                setAccentColor={setAccentColor}
                                setAddColor={setAddColor}
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
