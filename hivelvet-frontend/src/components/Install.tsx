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

import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import InstallService from '../services/install.service';

import { Steps, Button, message, Row, Col, Form, Result } from 'antd';
import DynamicIcon from './DynamicIcon';
import { T } from '@transifex/react';
import axios from 'axios';
import {Step1Form} from "./Step1Form";
import {Step2Form} from "./Step2Form";
import {Step3Form} from "./Step3Form";

const API_URL = process.env.REACT_APP_API_URL;
const { Step } = Steps;

type Props = {
    installed: boolean;
    handleInstall: any;
};

const Install = (props: Props) => {
    const { handleInstall } = props;
    const [stepForm] = Form.useForm();
    const initialValues = {
        username: '',
        email: '',
        password: '',

        company_name: '',
        company_url: '',
        platform_name: '',
        term_url: '',
        policy_url: '',
        branding_colors: {},

        presetsConfig: [],
    };

    const [activeStep, setActiveStep] = React.useState(0);
    const [successful, setSuccessful] = React.useState(false);
    const [errors, setErrors] = React.useState({});

    const [primaryColor, setPrimaryColor] = React.useState('');
    const [secondaryColor, setSecondaryColor] = React.useState('');
    const [accentColor, setAccentColor] = React.useState('');
    const [addColor, setAddColor] = React.useState('');
    const [file, setFile] = React.useState<any>();

    const [presets, setPresets] = React.useState([]);

    useEffect(() => {
        InstallService.collect_settings()
            .then((response) => {
                const settings = response.data;
                if (settings) {
                    stepForm.setFieldsValue({
                        company_name: settings.company_name,
                        company_url: settings.company_website,
                        platform_name: settings.platform_name,
                    });
                    setPrimaryColor(settings.primary_color);
                    setSecondaryColor(settings.secondary_color);
                    setAccentColor(settings.accent_color);
                    setAddColor(settings.additional_color);
                }
            })
            .catch((error) => {
                console.log(error);
            });
        InstallService.collect_presets()
            .then((response) => {
                setPresets(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    function next() {
        const nextStep = activeStep + 1;
        setActiveStep(nextStep);
    }
    function prev() {
        const prevStep = activeStep - 1;
        setActiveStep(prevStep);
    }

    const steps = [
        {
            title: 'Administrator account',
            content: <Step1Form errors={errors} />,
            button: 'Create',
            span: 8,
            offset: 4,
        },
        {
            title: 'Company & Branding',
            content: <Step2Form
                errors={errors}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                accentColor={accentColor}
                addColor={addColor}
                setPrimaryColor={setPrimaryColor}
                setSecondaryColor={setSecondaryColor}
                setAccentColor={setAccentColor}
                setAddColor={setAddColor}
                setFile={setFile} />,
            button: 'Next',
            span: 15,
            offset: 2,
        },
        {
            title: 'BigBlueButton Settings',
            content: <Step3Form presets={presets} />,
            button: 'Finish',
            span: 18,
            offset: 1,
        },
    ];

    const onFinish = () => {
        if (activeStep < steps.length - 1) {
            next();
        } else {
            const formData = stepForm.getFieldsValue(true);
            formData.branding_colors = {
                'primary_color': primaryColor,
                'secondary_color': secondaryColor,
                'accent_color': accentColor,
                'add_color': addColor,
            };
            formData.presetsConfig = presets;
            InstallService.install(formData)
                .then((response) => {
                    setSuccessful(true);
                })
                .catch((error) => {
                    setErrors({});
                    const responseData = error.response.data;
                    if (responseData.errors) {
                        const errors = responseData.errors;
                        setErrors(errors);
                        if ('username' in errors || 'email' in errors || 'password' in errors) {
                            setActiveStep(0);
                        }
                        else {
                            setActiveStep(1);
                        }
                    }
                });
            if (file != undefined) {
                const fdata = new FormData();
                fdata.append('logo', file.originFileObj, file.originFileObj.name);
                fdata.append('logo_name', file.originFileObj.name);
                axios.post(API_URL + '/save-logo', fdata)
                    .then((response) => {
                        console.log(response);
                    })
                    .catch((error) => {
                        const responseErrors = error.response.data.errors;
                        message.error(responseErrors);
                    });
            }
        }
    };

    return (
        <Row>
            {successful ? (
                <Col span={10} offset={7} className="section-top">
                    <Result
                        status="success"
                        icon={<DynamicIcon type="CheckOutlined" className="success-install-icon" />}
                        title={<T _str="Application installed !" />}
                        extra={
                            <Link to={'/login'} onClick={handleInstall} className="ant-btn ant-btn-primary ant-btn-lg">
                                <T _str="Start using Hivelvet" />
                            </Link>
                        }
                    />
                </Col>
            ) : (
                <>
                    <Col span={4}>
                        <Steps className="install-steps" size="small" direction="vertical" current={activeStep}>
                            {steps.map((item) => (
                                <Step key={item.title} title={<T _str={item.title} />} />
                            ))}
                        </Steps>
                    </Col>
                    <Col span={steps[activeStep].span} offset={steps[activeStep].offset}>
                        <Form
                            layout="vertical"
                            name="install_form"
                            className="install-form steps-content"
                            form={stepForm}
                            initialValues={initialValues}
                            requiredMark={false}
                            scrollToFirstError={true}
                            validateTrigger="onSubmit"
                            onFinish={onFinish}
                        >
                            {steps[activeStep].content}
                            <Form.Item
                                className={
                                    activeStep === steps.length - 1
                                        ? 'button-container final-step-btn'
                                        : 'button-container'
                                }
                            >
                                {activeStep > 0 && (
                                    <Button className="prev" onClick={() => prev()} block>
                                        <T _str="Previous" />
                                    </Button>
                                )}
                                {activeStep <= steps.length - 1 && (
                                    <Button type="primary" htmlType="submit" block>
                                        <T _str={steps[activeStep].button} />
                                    </Button>
                                )}
                            </Form.Item>
                        </Form>
                    </Col>
                </>
            )}
        </Row>
    );
};

export default Install;
