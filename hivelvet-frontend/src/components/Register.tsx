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
import {Link} from 'react-router-dom';
import AuthService from '../services/auth.service';

import { Form, Input, Button, Checkbox, Alert, Col, Row, Typography, Card, Result } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { T } from '@transifex/react';

const { Title, Paragraph } = Typography;

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
                { successful ?
                    <Col span={10} offset={7} className="section-top">
                        <Result
                            status="success"
                            title="Registration completed successfully"
                            subTitle={message}
                            extra={
                                <Link to={"/login"} className="ant-btn ant-btn-lg">
                                    Login now
                                </Link>
                            }
                        />
                    </Col>
                    :
                    <Col span={8} offset={8} className="section-top">
                        <Card className="form-content">
                            <Paragraph className="form-header text-center">
                                <img className="form-img" src="images/logo_02.png" alt="Logo"/>
                                <Title level={4}>
                                    {' '}
                                    <T _str="Sign Up" />
                                </Title>
                            </Paragraph>

                            {message && (
                                <Alert
                                    type="error"
                                    className="alert-msg"
                                    message={<T _str={message} />}
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
                                    <Input placeholder="Username" />
                                </Form.Item>
                                <Form.Item
                                    label={<T _str="Email" />}
                                    name="email"
                                    hasFeedback
                                    rules={[
                                        {
                                            type: 'email',
                                            message: 'Email invalid',
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
                                    <Input.Password placeholder="Confirm Password"/>
                                </Form.Item>

                                <Form.Item
                                    className="form-agree"
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
                                        I agree to the <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>
                                    </Checkbox>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        block
                                    >
                                        <T _str="Register" />
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                }
            </Row>
        );
    }
}

export default Register;
