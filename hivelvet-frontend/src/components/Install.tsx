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
import { Link } from 'react-router-dom';
import InstallService from '../services/install.service';

import {
    Steps,
    Button,
    message,
    Row,
    Col,
    Form,
    Input,
    Typography,
    Upload,
    Card,
    Modal,
    Switch,
    Result,
    Alert,
    Tooltip,
} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, InboxOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import ColorPicker from 'rc-color-picker/lib/ColorPicker';
import DynamicIcon from './DynamicIcon';
import { RcFile } from 'antd/lib/upload';
import { T } from '@transifex/react';
import axios from 'axios';
import { Trans, useTranslation, withTranslation } from 'react-i18next';

const API_URL = process.env.REACT_APP_API_URL;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Grid, Meta } = Card;
const { Dragger } = Upload;

type Props = {
    installed: boolean;
    handleInstall: any;
};

const Install = (props: Props) => {
    const { handleInstall } = props;
    const { t, i18n } = useTranslation();

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
    const [errorsStep1, setErrorsStep1] = React.useState([]);
    const [errorsStep2, setErrorsStep2] = React.useState([]);
    const [successMessage, setSuccessMessage] = React.useState('');

    const [settings, setSettings] = React.useState([]);
    const [primaryColor, setPrimaryColor] = React.useState('');
    const [secondaryColor, setSecondaryColor] = React.useState('');
    const [accentColor, setAccentColor] = React.useState('');
    const [addColor, setAddColor] = React.useState('');
    const [fileList, setFileList] = React.useState();
    const [file, setFile] = React.useState<any>();

    const [presets, setPresets] = React.useState([]);
    const [modalTitle, setModalTitle] = React.useState('');
    const [modalContent, setModalContent] = React.useState([]);
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState('');

    if (presets.length == 0 && settings.length == 0) {
        InstallService.collect_settings()
            .then((response) => {
                const settings = response.data;
                if (settings) {
                    setSettings(settings);
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
    }

    const Step1Form = () => {
        return (
            <div>
                <Paragraph className="form-header text-center">
                    <Title level={4}>
                        {' '}
                        <Trans i18nKey="create-administrator-account" />
                    </Title>
                </Paragraph>

                <Form.Item
                    label={<Trans i18nKey="username.label" />}
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: <Trans i18nKey="username.required" />,
                        },
                    ]}
                >
                    <Input placeholder="Username" />
                </Form.Item>

                <Form.Item
                    label={<Trans i18nKey="email.label" />}
                    name="email"
                    rules={[
                        {
                            type: 'email',
                            message: <Trans i18nKey="email.invalid" />,
                        },
                        {
                            required: true,
                            message: <Trans i18nKey="email.required" />,
                        },
                    ]}
                >
                    <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                    label={<Trans i18nKey="password.label" />}
                    name="password"
                    rules={[
                        {
                            min: 4,
                            message: <Trans i18nKey="password.size" />,
                        },
                        {
                            required: true,
                            message: <Trans i18nKey="password.required" />,
                        },
                    ]}
                >
                    <Input.Password
                        placeholder="Password"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </Form.Item>
            </div>
        );
    };
    const Step2Form = () => {
        const changeCompany = (e) => {
            const company_value = e.target.value;
            /*stepForm.setFieldsValue({
                 platform_name : company_value + " Hivelvet"
             });*/
        };
        const normFile = (e: any) => {
            if (Array.isArray(e)) {
                return e;
            }
            return e && e.fileList;
        };
        const handleChangeFile = (info: any) => {
            let fileList: any = [...info.fileList];
            fileList = fileList.slice(-1);
            const img =
                fileList[0].type === 'image/jpg' ||
                fileList[0].type === 'image/jpeg' ||
                fileList[0].type === 'image/png';
            if (img) {
                setFileList(fileList);
                setFile(fileList[0]);
            }
        };

        return (
            <div className="company-container">
                <div className="box">
                    <Paragraph className="form-header">
                        <Title level={4}>
                            {' '}
                            <Trans i18nKey="company.label" />
                        </Title>
                    </Paragraph>
                    {errorsStep2.length > 0 && (
                        <Alert
                            type="error"
                            className="alert-msg"
                            message={
                                errorsStep2.length > 1 ? (
                                    <ul className="errors-list">
                                        {errorsStep2.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <T _str={errorsStep2.toString()} />
                                )
                            }
                            showIcon
                        />
                    )}
                    <Form.Item
                        label={<Trans i18nKey="company.name" />}
                        name="company_name"
                        rules={[
                            {
                                required: true,
                                message: <Trans i18nKey="company.required" />,
                            },
                        ]}
                    >
                        <Input placeholder="Company Name" onChange={changeCompany} />
                    </Form.Item>

                    <Form.Item
                        label={<Trans i18nKey="company.website.label" />}
                        name="company_url"
                        rules={[
                            {
                                required: true,
                                message: <Trans i18nKey="company.website.required" />,
                            },
                            {
                                type: 'url',
                                message: <Trans i18nKey="company.website.invalid" />,
                            },
                        ]}
                    >
                        <Input placeholder="Company website" />
                    </Form.Item>

                    <Form.Item
                        label={<Trans i18nKey="platform.label" />}
                        name="platform_name"
                        rules={[
                            {
                                required: true,
                                message: <Trans i18nKey="platform.required" />,
                            },
                        ]}
                    >
                        <Input placeholder="Platform Name" />
                    </Form.Item>

                    <Form.Item
                        label={<Trans i18nKey="terms_url.label" />}
                        name="term_url"
                        rules={[
                            {
                                type: 'url',
                                message: <Trans i18nKey="terms_url.invalid" />,
                            },
                        ]}
                    >
                        <Input placeholder="Terms of use URL" />
                    </Form.Item>

                    <Form.Item
                        label={<Trans i18nKey="privacy_policy_url.label" />}
                        name="policy_url"
                        rules={[
                            {
                                type: 'url',
                                message: <Trans i18nkey="privacy_policy_url.invalid" />,
                            },
                        ]}
                    >
                        <Input placeholder="Privacy Policy URL" />
                    </Form.Item>
                </div>
                <div className="box last">
                    <Paragraph className="form-header">
                        <Title level={4}>
                            {' '}
                            <Trans i18nKey="branding" />
                        </Title>
                    </Paragraph>
                    <Form.Item>
                        <Form.Item valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                            <Dragger
                                name="logo"
                                showUploadList={{ showRemoveIcon: false }}
                                fileList={fileList}
                                accept=".png,.jpg,.jpeg"
                                onChange={(info) => {
                                    handleChangeFile(info);
                                }}
                                beforeUpload={(file: RcFile) => {
                                    if (
                                        file.type === 'image/jpg' ||
                                        file.type === 'image/png' ||
                                        file.type === 'image/jpeg'
                                    ) {
                                        message.success(t('success-_upload'));
                                        return false;
                                    }
                                    message.error(t('wrong_file'));
                                    return null;
                                }}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <Text strong className="ant-upload-text">
                                    <Trans i18nKey="drop-logo-here" />
                                </Text>
                                <p className="ant-upload-hint">.png .jpg .jpeg ...</p>
                            </Dragger>
                        </Form.Item>
                    </Form.Item>
                    <div className="colors-container">
                        <Form.Item label={<Trans i18nKey="primary_color" />}>
                            <ColorPicker
                                animation="slide-up"
                                defaultColor={primaryColor}
                                onClose={(color) => {
                                    setPrimaryColor(color.color);
                                }}
                                placement="bottomLeft"
                            >
                                <span className="rc-color-picker-trigger" />
                            </ColorPicker>

                            <span className="color-palette-picker-value">{primaryColor}</span>
                        </Form.Item>
                        <Form.Item label={<Trans i18nKey="secondary_color" />}>
                            <ColorPicker
                                animation="slide-up"
                                defaultColor={secondaryColor}
                                onClose={(color) => {
                                    setSecondaryColor(color.color);
                                }}
                                placement="bottomLeft"
                            >
                                <span className="rc-color-picker-trigger" />
                            </ColorPicker>

                            <span className="color-palette-picker-value">{secondaryColor}</span>
                        </Form.Item>
                        <Form.Item label={<Trans i18nKey="accent_color" />}>
                            <ColorPicker
                                animation="slide-up"
                                defaultColor={accentColor}
                                onClose={(color) => {
                                    setAccentColor(color.color);
                                }}
                                placement="bottomLeft"
                            >
                                <span className="rc-color-picker-trigger" />
                            </ColorPicker>

                            <span className="color-palette-picker-value">{accentColor}</span>
                        </Form.Item>
                        <Form.Item label={<Trans i18nKey="additional_color" />}>
                            <ColorPicker
                                animation="slide-up"
                                defaultColor={addColor}
                                onClose={(color) => {
                                    setAddColor(color.color);
                                }}
                                placement="bottomLeft"
                            >
                                <span className="rc-color-picker-trigger" />
                            </ColorPicker>

                            <span className="color-palette-picker-value">{addColor}</span>
                        </Form.Item>
                    </div>
                </div>
            </div>
        );
    };
    const Step3Form = () => {
        const showModal = (title, content, indexCateg) => {
            setIsModalVisible(true);
            setModalTitle(title);
            setModalContent(content);
            setSelectedCategory(indexCateg);
        };
        const handleOk = () => {
            presets[selectedCategory].subcategories = modalContent;
            setPresets(presets);
            setIsModalVisible(false);
        };
        const handleCancel = () => {
            setIsModalVisible(false);
        };

        return (
            <>
                <Paragraph className="final-form-header">
                    <Title level={4} className="final-form-header">
                        {' '}
                        <Trans i18nKey="bigbluebutton_rooms_settings" />
                    </Title>

                    <Alert
                        className="settings-info"
                        message={<Trans i18nKey="customize_configuration" />}
                        type="info"
                        closeText={<Trans i18nKey="understand" />}
                    />
                </Paragraph>
                <Card bordered={false}>
                    {presets.map((item, index) => (
                        <Tooltip
                            key={item.name}
                            placement="rightTop"
                            title={
                                <ul>
                                    {item.subcategories.map((subItem) => (
                                        <li
                                            key={subItem.name}
                                            className={subItem.status == true ? 'text-black' : 'text-grey'}
                                        >
                                            {subItem.name}
                                        </li>
                                    ))}
                                </ul>
                            }
                        >
                            <Grid
                                key={item.name}
                                className="presets-grid"
                                onClick={() => showModal(item.name, item.subcategories, index)}
                            >
                                <Meta
                                    avatar={<DynamicIcon type={item.icon} className="PresetIcon" />}
                                    title={item.name}
                                />
                            </Grid>
                        </Tooltip>
                    ))}

                    <Modal
                        title={modalTitle}
                        className="presets-modal"
                        centered
                        visible={isModalVisible}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        cancelButtonProps={{ className: 'hidden' }}
                        footer={[
                            <Button key="submit" type="primary" onClick={handleOk}>
                                <Trans i18nKey="confirm" />
                            </Button>,
                        ]}
                    >
                        <div className="presets-body">
                            {modalContent.map((item) => (
                                <div key={item.id}>
                                    <Form.Item
                                        label={item.name}
                                        //name={item.id}
                                    >
                                        <Switch
                                            checkedChildren={<CheckOutlined />}
                                            unCheckedChildren={<CloseOutlined />}
                                            defaultChecked={item.status == true ? true : false}
                                            onChange={(checked) => {
                                                item.status = checked;
                                            }}
                                        />
                                    </Form.Item>
                                </div>
                            ))}
                        </div>
                    </Modal>
                </Card>
            </>
        );
    };

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
            title: t('administrator_account'),
            content: <Step1Form />,
            button: t('create'),
            span: 8,
            offset: 4,
        },
        {
            title: t('company.name') + '&' + t('branding'),
            content: <Step2Form />,
            button: t('next'),
            span: 15,
            offset: 2,
        },
        {
            title: t('bigBlueButton_settings'),
            content: <Step3Form />,
            button: t('finish'),
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
                    setSuccessMessage(response.data.message);
                })
                .catch((error) => {
                    setErrorsStep1([]);
                    setErrorsStep2([]);
                    const responseMessage = error.response.data;
                    if (responseMessage.userErrors) {
                        const userErrors = Object.values(responseMessage.userErrors);
                        const err = [];
                        userErrors.forEach(function (value: any) {
                            const keys = Object.keys(value);
                            keys.forEach(function (key) {
                                err.push(value[key]);
                            });
                        });
                        setErrorsStep1(err);
                        setActiveStep(0);
                    }
                    if (responseMessage.settingsErrors) {
                        const settingsErrors = Object.values(responseMessage.settingsErrors);
                        const err = [];
                        settingsErrors.forEach(function (value: any) {
                            const keys = Object.keys(value);
                            keys.forEach(function (key) {
                                err.push(value[key]);
                            });
                        });
                        setErrorsStep2(err);
                        setActiveStep(1);
                    }
                    if (responseMessage.userErrors && responseMessage.settingsErrors) {
                        setActiveStep(0);
                    }
                    setSuccessful(false);
                });

            if (file != undefined) {
                const fdata = new FormData();
                fdata.append('logo', file.originFileObj, file.originFileObj.name);
                fdata.append('logo_name', file.originFileObj.name);
                axios
                    .post(API_URL + '/save-logo', fdata)
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
                        title={successMessage}
                        extra={
                            <Link to={'/login'} onClick={handleInstall} className="ant-btn ant-btn-primary ant-btn-lg">
                                <Trans i18nkey="start-using-hivelvet" />
                            </Link>
                        }
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
                                        <Trans i18nKey="previous" />
                                    </Button>
                                )}
                                {activeStep <= steps.length - 1 && (
                                    <Button type="primary" htmlType="submit" block>
                                        {steps[activeStep].button}
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

export default withTranslation()(Install);
