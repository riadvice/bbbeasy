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
import AuthService from '../services/auth.service';

import { Steps, Button, Row, Col, Form, Input, Typography, Upload, Card, Modal, Switch, Result } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, InboxOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import ColorPicker from 'rc-color-picker/lib/ColorPicker';
import DynamicIcon from './DynamicIcon';
import { T } from '@transifex/react';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Meta } = Card;
const { Dragger } = Upload;

type Props = {
    installed: boolean;
    handleInstall: any;
};

const Install = (props : Props) => {
    const { installed, handleInstall } = props;
    const [stepForm] = Form.useForm();
    const defaultColor = '#fbbc0b';
    const initialValues = {
        username: '',
        email: '',
        password: '',

        company_name:'',
        company_url:'',
        platform_name:'',
        term_url:'',
        policy_url:'',
        branding_colors : {},

        presetsConfig: []
    };
    const [activeStep, setActiveStep] = React.useState(0);
    const [successful, setSuccessful] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const [primaryColor, setPrimaryColor] = React.useState(defaultColor);
    const [secondaryColor, setSecondaryColor] = React.useState(defaultColor);
    const [accentColor, setAccentColor] = React.useState(defaultColor);
    const [addColor, setAddColor] = React.useState(defaultColor);

    const [presets, setPresets] = React.useState([]);
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [modalTitle, setModalTitle] = React.useState('');
    const [modalContent, setModalContent] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = React.useState('');

    if (presets.length == 0) {
        AuthService.collectPresets()
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
                <Form.Item
                    label={<T _str="Username" />}
                    name="username"
                    hasFeedback
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
                    hasFeedback
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
                    hasFeedback
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
            stepForm.setFieldsValue({
                platform_name : company_value + " Hivelvet"
            });
        }
        return (
            <div className="company-container">
                <div className="box">
                    <Paragraph className="form-header">
                        <Title level={4}>
                            {' '}
                            <T _str="Company" />
                        </Title>
                    </Paragraph>
                    <Form.Item
                        label={<T _str="Company name" />}
                        name="company_name"
                        hasFeedback
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
                        hasFeedback
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
                        hasFeedback
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
                        hasFeedback
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
                        hasFeedback
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
                        <Form.Item valuePropName="fileList">
                            <Dragger name="files" action="/upload.do">
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <Text strong className="ant-upload-text">
                                    Drop your logo here
                                </Text>
                                <p className="ant-upload-hint">.rar .zip .doc .docx .pdf .jpg ...</p>
                            </Dragger>
                        </Form.Item>
                    </Form.Item>
                    <div className="colors-container">
                        <Form.Item label={<T _str="Primary color" />}>
                            <ColorPicker
                                animation="slide-up"
                                defaultColor={primaryColor}
                                onClose={ (color) => {
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
                                onClose={ (color) => {
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
                                onClose={ (color) => {
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
                                onClose={ (color) => {
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
            <div>
                <Paragraph className="form-header">
                    <Title level={4}>
                        {' '}
                        <T _str="Global rooms settings" />
                    </Title>
                </Paragraph>
                <Card bordered={false}>
                    {presets.map((item,index) => (
                        <Card.Grid key={item.name} className="presets-grid" onClick={() => showModal(item.name,item.subcategories,index)}>
                            <Meta avatar={<DynamicIcon type={item.icon} />} title={item.name} />
                        </Card.Grid>
                    ))}

                    <Modal
                        title={modalTitle}
                        className="presets-modal"
                        centered
                        visible={isModalVisible}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        cancelButtonProps={{ style: { display: 'none' } }}
                        footer={[
                            <Button key="submit" className="ant-btn-primary" onClick={handleOk}>
                                Saved
                            </Button>
                        ]}
                    >
                        <div className="presets-body">
                            {modalContent.map(item => (
                                <div key={item.id}>
                                    <Form.Item
                                        label={item.name}
                                        //name={item.id}
                                    >
                                        <Switch
                                            checkedChildren={<CheckOutlined />}
                                            unCheckedChildren={<CloseOutlined />}
                                            defaultChecked={item.status == true ? true : false}
                                            onChange={ (checked) => { item.status = checked }}
                                        />
                                    </Form.Item>
                                </div>
                            ))}
                        </div>
                    </Modal>
                </Card>
            </div>
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
                'primary_color' : primaryColor,
                'secondary_color' : secondaryColor,
                'accent_color' : accentColor,
                'add_color' : addColor,
            };
            formData.presetsConfig = presets;
            AuthService.install(formData)
                .then((response) => {
                    setSuccessful(true);
                    setMessage(response.data.message);
                })
                .catch((error) => {
                    //const responseMessage = error.response.data.message;
                    console.log(error);
                    setSuccessful(false);
                });
        }
    };

    return (
        <Row>
            { successful ? (
                <Col span={10} offset={7} className="section-top">
                    <Result
                        status="success"
                        title={message}
                        subTitle="Your application setup is complete"
                        extra={
                            <Link to={'/login'} onClick={handleInstall} className="ant-btn ant-btn-lg color-green">
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
                            onFinish={onFinish}
                        >
                            {steps[activeStep].content}
                            <Form.Item
                                className={
                                    activeStep === steps.length - 1 ? "button-container final-step-btn" : "button-container"
                                }
                            >
                                {activeStep > 0 && (
                                    <Button className='prev' onClick={() => prev()} block>
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