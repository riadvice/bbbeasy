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
import { Trans, useTranslation, withTranslation } from 'react-i18next';

import InstallService from '../services/install.service';
import SettingsService from '../services/settings.service';
import PresetSettingsService from '../services/preset.settings.service';

import { Steps, Button, Row, Col, Form, Result } from 'antd';
import DynamicIcon from './DynamicIcon';
import LoadingSpinner from './LoadingSpinner';

import { Step1Form } from './Step1Form';
import { Step2Form } from './Step2Form';
import { Step3Form } from './Step3Form';

import { UserPasswordForm } from './UserPasswordForm';

import { UploadFile } from 'antd/lib/upload/interface';
import { ThemeType } from '../types/ThemeType';
import { SettingsType } from '../types/SettingsType';
import { PresetType } from '../types/PresetType';

import axios from 'axios';
import { apiRoutes } from '../routing/backend-config';
import usersService from 'services/users.service';

const { Step } = Steps;

type stepType = {
    title: string;
    content: JSX.Element;
    button: string;
    span: number;
    offset: number;
};
type formType = {
    username: string;
    email: string;
    password: string;
    company_name: string;
    company_url: string;
    platform_name: string;
    term_url: string;
    policy_url: string;
    logo: string;
    theme: ThemeType;
    presetsConfig: PresetType[];
};

const Install = () => {
    const { t } = useTranslation();
    const logoname = 'logo-' + Date.now();
    const [stepForm] = Form.useForm();
    const initialValues: formType = {
        username: '',
        email: '',
        password: '',

        company_name: '',
        company_url: '',
        platform_name: '',
        term_url: '',
        policy_url: '',
        logo: '',
        theme: {
            brand_color: '',
            default_font_size: 0,
            border_radius: 0,
            wireframe_style: false,
        },

        presetsConfig: [],
    };

    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorNetwork, setErrorNetwork] = React.useState<string>('');
    const [locked, setLocked] = React.useState<boolean>(null);
    const [activeStep, setActiveStep] = React.useState<number>(0);
    const [successful, setSuccessful] = React.useState<boolean>(false);
    const [message, setMessage] = React.useState<string>('');

    const [brandColor, setBrandColor] = React.useState<string>('');
    const [defaultFontSize, setDefaultFontSize] = React.useState<number>(0);
    const [borderRadius, setBorderRadius] = React.useState<number>(0);
    const [wireframeStyle, setWireframeStyle] = React.useState<boolean>(false);
    const [file, setFile] = React.useState<UploadFile>(null);
    const [fileList, setFileList] = React.useState<UploadFile[]>(null);

    const [presets, setPresets] = React.useState<PresetType[]>([]);

    const getSettings = () => {
        SettingsService.collect_settings()
            .then((response) => {
                console.log(response.data);
                const settings: SettingsType = response.data;

                if (settings) {
                    stepForm.setFieldsValue({
                        company_name: settings.company_name,
                        company_url: settings.company_website,
                        platform_name: settings.platform_name,
                        term_url: settings.terms_use,
                        policy_url: settings.privacy_policy,
                        logo: settings.logo,
                        theme: {
                            brand_color: settings.brand_color,
                            default_font_size: settings.default_font_size,
                            border_radius: settings.border_radius,
                            wireframe_style: settings.wireframe_style,
                        },
                    });
                    setBrandColor(settings.brand_color);
                    setDefaultFontSize(settings.default_font_size);
                    setBorderRadius(settings.border_radius);
                    setWireframeStyle(settings.wireframe_style);
                    if (settings.logo != null) {
                        const settingLogo: UploadFile = {
                            uid: '1',
                            name: logoname,
                            status: 'done',
                        };
                        setFileList([settingLogo]);
                        setFile(settingLogo);
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getPresetSettings = () => {
        PresetSettingsService.collect_preset_settings()
            .then((response) => {
                setPresets(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        localStorage.removeItem('user');

        InstallService.install()
            .then((response) => {
                setLocked(false);

                getSettings();
                getPresetSettings();
            })
            .catch((error) => {
                if (error.response.status !== 200) {
                    setErrorNetwork(error.response.status);
                }

                if (error.response.data.locked) {
                    setLocked(true);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    function next() {
        const nextStep: number = activeStep + 1;
        setActiveStep(nextStep);
    }
    function prev() {
        const prevStep: number = activeStep - 1;
        setActiveStep(prevStep);
    }

    const steps: stepType[] = [
        {
            title: t('administrator_account'),
            content: <Step1Form message={message} success={message == ''} />,
            button: t('next'),
            span: 8,
            offset: 4,
        },
        {
            title: t('company.label') + ' & ' + t('branding'),
            content: (
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
            ),
            button: t('next'),
            span: 15,
            offset: 2,
        },
        {
            title: t('bigBlueButton_settings'),
            content: <Step3Form presets={presets} />,
            button: t('finish'),
            span: 18,
            offset: 1,
        },
    ];

    const onFinish = () => {
        const stepsData: formType = stepForm.getFieldsValue(true);
        if (activeStep == 0) {
            setMessage('');
            usersService
                .collect_users(stepsData)
                .then(() => {
                    next();
                })
                .catch((error) => {
                    setMessage(error.response.data.message);
                });
        } else if (activeStep < steps.length - 1) {
            next();
        } else {
            //edit file
            if (file != undefined && file.originFileObj != null) {
                const formData: FormData = new FormData();
                formData.append('logo', file.originFileObj, file.name);
                formData.append('logo_name', file.name);

                axios
                    .post(apiRoutes.SAVE_FILE_URL, formData)
                    .then((response) => {
                        console.log(response);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }

            stepsData.theme = {
                brand_color: brandColor,
                default_font_size: defaultFontSize,
                border_radius: borderRadius,
                wireframe_style: wireframeStyle,
            };
            stepsData.presetsConfig = presets;

            if (file != undefined && file.originFileObj != null) {
                stepsData.logo = file.name;
            } else if (file == undefined && stepsData.logo != null) {
                stepsData.logo = null;
            }

            InstallService.install(stepsData)
                .then(() => {
                    setSuccessful(true);
                })
                .catch((error) => {
                    setMessage(error.response.data.message);
                    console.log(error.response.data.message);
                });
        }
    };

    return (
        <Row justify={isLoading || locked || errorNetwork ? 'center' : 'start'}>
            {isLoading ? (
                <LoadingSpinner className="m-5" />
            ) : locked ? (
                <Result
                    status="403"
                    title={<Trans i18nKey="install_locked_title" />}
                    subTitle={<Trans i18nKey="install_locked_text" />}
                />
            ) : errorNetwork ? (
                <Result
                    status="404"
                    title={<Trans i18nKey="install_error_title" />}
                    subTitle={<Trans i18nKey="install_error_text" />}
                />
            ) : successful ? (
                <Col span={10} offset={7} className="section-top">
                    <Result
                        status="success"
                        icon={<DynamicIcon type="CheckOutlined" className="success-install-icon" />}
                        title={<Trans i18nKey="success_install" />}
                    />
                </Col>
            ) : (
                <>
                    <Col span={4}>
                        <Steps className="install-steps" size="small" direction="vertical" current={activeStep}>
                            {steps.map((item) => (
                                <Step key={item.title} title={item.title} />
                            ))}
                        </Steps>
                    </Col>
                    <Col span={steps[activeStep].span} offset={steps[activeStep].offset}>
                        <Form
                            layout="vertical"
                            name="install_form"
                            className="install-form"
                            form={stepForm}
                            initialValues={initialValues}
                            requiredMark={false}
                            scrollToFirstError={true}
                            validateTrigger="onSubmit"
                            onFinish={onFinish}
                            onValuesChange={() => setMessage('')}
                        >
                            {steps[activeStep].content}
                            <UserPasswordForm isHidden={activeStep != 0} />
                            <Row
                                className={
                                    activeStep === steps.length - 1
                                        ? 'button-container final-step-btn'
                                        : 'button-container'
                                }
                            >
                                {activeStep > 0 && (
                                    <Button
                                        onClick={() => prev()}
                                        className="btn-installer prev"
                                        style={{ 'width': '47%' }}
                                    >
                                        <Trans i18nKey="previous" />
                                    </Button>
                                )}
                                {activeStep <= steps.length - 1 && (
                                    <Button
                                        type="primary"
                                        className="btn-installer"
                                        htmlType="submit"
                                        style={activeStep == 0 ? { 'width': '100%' } : { 'width': '47%' }}
                                    >
                                        {steps[activeStep].button}
                                    </Button>
                                )}
                            </Row>
                        </Form>
                    </Col>
                </>
            )}
        </Row>
    );
};

export default withTranslation()(Install);
