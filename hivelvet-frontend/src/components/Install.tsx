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
import { Steps, Button, Row, Col, Form, Input, Typography, Upload, Card, Avatar, Modal } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, InboxOutlined } from '@ant-design/icons';
import { T } from '@transifex/react';
import ColorPicker from "rc-color-picker/lib/ColorPicker";
import "rc-color-picker/assets/index.css";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Meta } = Card;

const Install = () => {
    const [stepForm] = Form.useForm();
    const defaultColor = '#fbbc0b';
    const [activeStep, setActiveStep] = React.useState(0);
    const [primaryColor, setPrimaryColor] = React.useState(defaultColor);
    const [secondaryColor, setSecondaryColor] = React.useState(defaultColor);
    const [accentColor, setAccentColor] = React.useState(defaultColor);
    const [addColor, setAddColor] = React.useState(defaultColor);
    const initialValues = {
        username: '',
        email: '',
        password: '',

        company_name:'',
        company_url:'',
        platform_name:'',
        term_url:'',
        policy_url:'',

        primary_color: '',
        secondary_color: '',
        accent_color: '',
        add_color: '',
    };

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
                        iconRender={(visible) =>
                            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                    />
                </Form.Item>
            </div>
        );
    };
    const Step2Form = () => {
        const normFile = (e: any) => {
            console.log('Upload event:', e);
            if (Array.isArray(e)) {
                return e;
            }
            return e && e.fileList;
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
                        <Input placeholder="Company name" />
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
                                //warningOnly: true
                                message: 'Company website is not a valid url'
                            }
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
                        label={<T _str="Term of use URL" />}
                        name="term_url"
                        hasFeedback
                        rules={[
                            {
                                required: true,
                                message: 'Term of use URL is required',
                            },
                            {
                                type: 'url',
                                message: 'Term of use url is not a valid url'
                            }
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
                                required: true,
                                message: 'Privacy Policy is required',
                            },
                            {
                                type: 'url',
                                message: 'Privacy Policy url is not a valid url'
                            }
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
                            <Upload.Dragger name="files" action="/upload.do">
                                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                                <Text strong className="ant-upload-text">Drop your logo here</Text>
                                <p className="ant-upload-hint">.rar .zip .doc .docx .pdf .jpg ...</p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Form.Item>
                    <div className="colors-container">
                        <Form.Item
                            label={<T _str="Primary color" />}
                            name="primary_color"
                        >
                            <ColorPicker
                                animation="slide-up"
                                defaultColor={primaryColor}
                                onChange={ (color) => { setPrimaryColor(color.color) }}
                                placement="bottomLeft"
                            >
                                <span className="rc-color-picker-trigger" />
                            </ColorPicker>

                            <span className="color-palette-picker-value">
                                {primaryColor}
                            </span>
                        </Form.Item>
                        <Form.Item
                            label={<T _str="Secondary color" />}
                            name="secondary_color"
                        >
                            <ColorPicker
                                animation="slide-up"
                                defaultColor={secondaryColor}
                                onChange={ (color) => { setSecondaryColor(color.color) }}
                                placement="bottomLeft"
                            >
                                <span className="rc-color-picker-trigger" />
                            </ColorPicker>

                            <span className="color-palette-picker-value">
                                {secondaryColor}
                            </span>

                        </Form.Item>
                        <Form.Item
                            label={<T _str="Accent color" />}
                            name="accent_color"
                        >
                            <ColorPicker
                                animation="slide-up"
                                defaultColor={accentColor}
                                onChange={ (color) => { setAccentColor(color.color) }}
                                placement="bottomLeft"
                            >
                                <span className="rc-color-picker-trigger" />
                            </ColorPicker>

                            <span className="color-palette-picker-value">
                                {accentColor}
                            </span>
                        </Form.Item>
                        <Form.Item
                            label={<T _str="Additional color" />}
                            name="add_color"
                        >
                            <ColorPicker
                                animation="slide-up"
                                defaultColor={addColor}
                                onChange={ (color) => { setAddColor(color.color) }}
                                placement="bottomLeft"
                            >
                                <span className="rc-color-picker-trigger" />
                            </ColorPicker>

                            <span className="color-palette-picker-value">
                                {addColor}
                            </span>
                        </Form.Item>
                    </div>
                </div>
            </div>
        );
    };
    const Step3Form = () => {
        const presets = [
            {
                title : 'Global'
            },
            {
                title : 'Security'
            },
            {
                title : 'Recording'
            },
            {
                title : 'Breakout Rooms'
            },

            {
                title : 'Webcams'
            },
            {
                title : 'Screenshare'
            },
            {
                title : 'Branding'
            },
            {
                title : 'Audio'
            },

            {
                title : 'Localisation'
            },
            {
                title : 'Whiteboard'
            },
            {
                title : 'Lock Settings'
            },
            {
                title : 'Layout'
            },

            {
                title : 'Guest policy'
            },
            {
                title : 'Learning anaytics dashboard'
            },
            {
                title : 'User Experience'
            },
            {
                title : 'ZcaleRight Load Balancer'
            }
        ];
        const [isModalVisible, setIsModalVisible] = React.useState(false);
        const [modalTitle, setModalTitle] = React.useState('');

        const showModal = (title) => {
            setIsModalVisible(true);
            setModalTitle(title);
        };
        const handleOk = () => {
            setIsModalVisible(false);
        };
        const handleCancel = () => {
            setIsModalVisible(false);
        };
        const getIcon = (title) => {
            const icon = title.replace(/\s/g, '-');
            return "uploads/"+icon+".png";
        };

        return (
            <div>
                <Paragraph className="form-header">
                    <Title level={4}>
                        {' '}
                        <T _str="Global rooms settings"/>
                    </Title>
                </Paragraph>
                <Card bordered={false}>
                    {presets.map(item => (
                        <Card.Grid key={item.title} className="presets-grid" onClick={() => showModal(item.title)}>
                            <Meta
                                avatar={<Avatar src={getIcon(item.title)}/>}
                                title={item.title}
                            />
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
                    >
                        <p>Modal content</p>
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
            offset: 4
        },
        {
            title: 'Company & Branding',
            content: <Step2Form />,
            button: 'Next',
            span: 15,
            offset: 2
        },
        {
            title: 'BigBlueButton Settings',
            content: <Step3Form />,
            button: 'Finish',
            span: 18,
            offset: 1
        },
    ];

    const onFinish = () => {
        if(activeStep < steps.length - 1) {
            next();
        }
        else {
            const formData = stepForm.getFieldsValue(true);
            formData.primary_color = primaryColor;
            formData.secondary_color = secondaryColor;
            formData.accent_color = accentColor;
            formData.add_color = addColor;
            console.log(formData);
        }
    };

    return (
        <Row>
            <Col span={4}>
                <Steps className="install-steps" size="small" direction="vertical" current={activeStep}>
                    {steps.map(item => (
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
                    <Form.Item className={ activeStep === steps.length - 1 ? "button-container final-step-btn" : "button-container"} >
                        {activeStep <= steps.length - 1 && (
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                            >
                                {steps[activeStep].button}
                            </Button>
                        )}

                        {activeStep > 0 && (
                                <Button
                                    className='prev'
                                    onClick={() => prev()}
                                    size="large"
                                    block
                                >
                                    Previous
                                </Button>
                        )}
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    )
}

export default Install;