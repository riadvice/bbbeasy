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

import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import AuthService from '../services/auth.service';

import '../App.css';
//import 'antd/dist/antd.css';
import { Form, Input, Button, Checkbox, message, Alert, Col, Row, Typography, Space } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

type Props = {};

type State = {
    email?: string;
    password?: string;
    successful: boolean;
    message: string;
};

class Login extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.state = {
            email: '',
            password: '',
            successful: false,
            message: ''
        };
    }

    handleLogin(formValue: any) {
        const { email, password } = formValue;
        AuthService.login(email, password)
            .then(response => {
                const responseMessage = response.data.message;
                message.success({
                    content: responseMessage,
                    style: {
                        marginTop: '20vh',
                    },
                });
                this.setState({
                    successful: true,
                    message: responseMessage
                });
                const user = response.data.user;
                localStorage.setItem("user", JSON.stringify(user));
            })
            .catch(error => {
                const responseMessage = error.response.data.message;
                this.setState({
                    successful: false,
                    message: responseMessage
                });
            });
    }

    render() {
        const { successful, message } = this.state;
        const initialValues = {
            email: '',
            password: '',
            successful: false,
            message: '',
            remember: true
        };

        return (
            <Row>
                <Col span={8} offset={8} className='section-top'>
                    <Paragraph className='pricing-header text-center'>
                        <Title style={{ fontWeight : 500 }}>Get started</Title>
                        <Text>Sign in to continue to our application</Text>
                    </Paragraph>
                    <Space direction='horizontal' style={{width: '100%', justifyContent: 'center'}}>
                        <Paragraph className='pricing-table page-login'>
                            <Paragraph className='pricing-table-inner is-revealing'>
                                { message && !successful &&
                                    <Alert
                                        style={{ marginBottom : 24 }}
                                        message="Error"
                                        description={ message }
                                        type="error"
                                        showIcon />
                                }
                                <Form
                                    layout='vertical'
                                    name="normal_login"
                                    className="login-form"
                                    initialValues={initialValues}
                                    onFinish={this.handleLogin}>
                                    <Form.Item
                                        label="Email"
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
                                        ]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="Password"
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
                                        ]}>
                                        <Input.Password
                                            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                        />
                                    </Form.Item>
                                    <Form.Item>
                                        <Form.Item name="remember" valuePropName="checked" noStyle>
                                            <Checkbox>Remember me</Checkbox>
                                        </Form.Item>

                                        <a className="login-form-forgot" href="#">
                                            Forgot password
                                        </a>
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" className="login-form-button" size='large'>
                                            Log in now
                                        </Button>
                                    </Form.Item>
                                </Form>
                                <Paragraph className="text-center mt-12">
                                    <Text style={{color : "white" }}>
                                        Don&apos;t have an account ?
                                    </Text>
                                    <Link to={'/register'} className="login-link"> Register here </Link>
                                </Paragraph>
                            </Paragraph>
                        </Paragraph>
                    </Space>
                </Col>
            </Row>
        );
    }
}

export default Login;