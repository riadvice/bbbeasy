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

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/auth.service';

import '../App.css';
//import 'antd/dist/antd.css';
import { Form, Input, Button, Checkbox, message, Alert, Col, Row, Typography, Space } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { T } from '@transifex/react';

const { Text, Title, Paragraph } = Typography;

type Props = {};

type State = {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    successful: boolean;
    message: string;
};

class Register extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.handleRegistration = this.handleRegistration.bind(this);
        this.state = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            successful: false,
            message: '',
        };
    }

    handleRegistration(formValue: any) {
        const { username, email, password, confirmPassword } = formValue;
        AuthService.register(username, email, password, confirmPassword)
            .then((response) => {
                const responseMessage = response.data.message;
                message.success({
                    content: responseMessage,
                    style: {
                        marginTop: '20vh',
                    },
                });
                this.setState({
                    successful: true,
                    message: responseMessage,
                });
            })
            .catch((error) => {
                const responseMessage = error.response.data.message;
                this.setState({
                    successful: false,
                    message: responseMessage,
                });
            });
    }

    render() {
        const { successful, message } = this.state;
        const initialValues = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            successful: false,
            message: '',
        };

        return (
            <Row>
                <Col span={8} offset={8} className="section-top">
                    <Paragraph className="pricing-header text-center">
                        <Title style={{ fontWeight: 500 }}>
                            <T _str="Join us" />
                        </Title>
                        <Text>
                            <T _str="Register now and join our community" />
                        </Text>
                    </Paragraph>
                    <Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>
                        <Paragraph className="pricing-table">
                            <Paragraph className="pricing-table-inner is-revealing">
                                {message && !successful && (
                                    <Alert
                                        style={{ marginBottom: 24 }}
                                        message="Error"
                                        description={<T _str={message} />}
                                        type="error"
                                        showIcon
                                    />
                                )}
                                <Form
                                    layout="vertical"
                                    name="register"
                                    className="register-form"
                                    initialValues={initialValues}
                                    onFinish={this.handleRegistration}
                                >
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
                                        <Input />
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
                                        <Input />
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
                                            iconRender={(visible) =>
                                                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                            }
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label={<T _str="Confirm Password" />}
                                        name="confirmPassword"
                                        dependencies={['password']}
                                        hasFeedback
                                        rules={[
                                            {
                                                min: 4,
                                                message: 'Confirm password must be at least 4 characters',
                                            },
                                            {
                                                required: true,
                                                message: 'Confirm password is required',
                                            },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(
                                                        new Error('The two passwords that you entered do not match')
                                                    );
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item
                                        name="agreement"
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                validator: (_, value) =>
                                                    value
                                                        ? Promise.resolve()
                                                        : Promise.reject(new Error('Should accept agreement')),
                                            },
                                        ]}
                                    >
                                        <Checkbox>
                                            {' '}
                                            <a href="#">
                                                <T _str="I have read the agreement" />
                                            </a>
                                        </Checkbox>
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="login-form-button"
                                            size="large"
                                        >
                                            <T _str="Register now" />
                                        </Button>
                                    </Form.Item>
                                </Form>
                                <Paragraph className="text-center mt-12">
                                    <Text style={{ color: 'white' }}>
                                        <T _str="Have already an account" />
                                    </Text>
                                    <Link to={'/login'} className="login-link">
                                        {' '}
                                        <T _str="Login Here" />{' '}
                                    </Link>
                                </Paragraph>
                            </Paragraph>
                        </Paragraph>
                    </Space>
                </Col>
            </Row>
        );
    }
}

export default Register;
