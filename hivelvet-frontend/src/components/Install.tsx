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
                        <T _str="Create an administrator account" />
                    </Title>
                </Paragraph>
                {errorsStep1.length > 0 && (
                    <Alert
                        type="error"
                        className="alert-msg"
                        message={
                            errorsStep1.length > 1 ? (
                                <ul className="errors-list">
                                    {errorsStep1.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <T _str={errorsStep1.toString()} />
                            )
                        }
                        showIcon
                    />
                )}
                <Form.Item
                    label={<T _str="Username" />}
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Username is required',
                        },
                    ]}
                >
                    <Input placeholder="Username" />
                </Form.Item>

                <Form.Item
                    label={<T _str="Email" />}
                    name="email"
                    rules={[
                        {
                            type: 'email',
                            message: 'Email is invalid',
                        },
                        {
                            required: true,
                            message: 'Email is required',
                        },
                    ]}
                >
                    <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                    label={<T _str="Password" />}
                    name="password"
                    rules={[
                        {
                            min: 4,
                            message: 'Password must be at least 4 characters',
                        },
                        {
                            required: true,
                            message: 'Password is required',
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
                            <T _str="Company" />
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
                        label={<T _str="Company name" />}
                        name="company_name"
                        rules={[
                            {
                                required: true,
                                message: 'Company name is required',
                            },
                        ]}
                    >
                        <Input placeholder="Company name" onChange={changeCompany} />
                    </Form.Item>

                    <Form.Item
                        label={<T _str="Company website" />}
                        name="company_url"
                        rules={[
                            {
                                required: true,
                                message: 'Company website is required',
                            },
                            {
                                type: 'url',
                                message: 'Company website is not a valid url',
                            },
                        ]}
                    >
                        <Input placeholder="Company website" />
                    </Form.Item>

                    <Form.Item
                        label={<T _str="Platform name" />}
                        name="platform_name"
                        rules={[
                            {
                                required: true,
                                message: 'Platform name is required',
                            },
                        ]}
                    >
                        <Input placeholder="Platform name" />
                    </Form.Item>

                    <Form.Item
                        label={<T _str="Terms of use URL" />}
                        name="term_url"
                        rules={[
                            {
                                type: 'url',
                                message: 'Term of use url is not a valid url',
                            },
                        ]}
                    >
                        <Input placeholder="Term of use URL" />
                    </Form.Item>

                    <Form.Item
                        label={<T _str="Privacy Policy URL" />}
                        name="policy_url"
                        rules={[
                            {
                                type: 'url',
                                message: 'Privacy Policy url is not a valid url',
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
                            <T _str="Branding" />
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
                                        message.success('file uploaded successfully');
                                        return false;
                                    }
                                    message.error('wrong file');
                                    return null;
                                }}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <Text strong className="ant-upload-text">
                                    Drop your logo here
                                </Text>
                                <p className="ant-upload-hint">.png .jpg .jpeg ...</p>
                            </Dragger>
                        </Form.Item>
                    </Form.Item>
                    <div className="colors-container">
                        <Form.Item label={<T _str="Primary color" />}>
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
                        <Form.Item label={<T _str="Secondary color" />}>
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
                        <Form.Item label={<T _str="Accent color" />}>
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
                        <Form.Item label={<T _str="Additional color" />}>
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
            //set old content of selected category
            /*presets[selectedCategory].subcategories = modalContent;
            setPresets(presets);*/
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
                        <T _str="BigBlueButton rooms settings" />
                    </Title>

                    <Alert
                        className="settings-info"
                        message="Click on each button to customise the configuration group and hover it to get its summary."
                        type="info"
                        closeText="I understand, thank you!"
                    />
                </Paragraph>
                <Card bordered={false}>
                    {presets.map((item, index) => (
                        <Tooltip
                            key={item.name}
                            placement="rightTop"
                            overlayClassName="install-tooltip"
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
                                Confirm
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
            title: 'Administrator account',
            content: <Step1Form />,
            button: 'Create',
            span: 8,
            offset: 4,
        },
        {
            title: 'Company & Branding',
            content: <Step2Form />,
            button: 'Next',
            span: 15,
            offset: 2,
        },
        {
            title: 'BigBlueButton Settings',
            content: <Step3Form />,
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
                    setSuccessMessage('Application installed !');
                })
                .catch((error) => {
                    console.log(error);
                    setErrorsStep1([]);
                    setErrorsStep2([]);
                    const responseMessage = error.response.data;
                    if (responseMessage.userErrors) {
                        const err = [];
                        const userErrors = responseMessage.userErrors;
                        Object.values(userErrors).map((value) => {
                            Object.keys(value).map((key) => {
                                err.push(value[key]);
                            });
                        });
                        setErrorsStep1(err);
                        setActiveStep(0);
                    }
                    if (responseMessage.settingsErrors) {
                        const err = [];
                        const settingsErrors = responseMessage.settingsErrors;
                        Object.values(settingsErrors).map((value) => {
                            Object.keys(value).map((key) => {
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
                                Start using Hivelvet
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
                                        Previous
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

export default Install;
