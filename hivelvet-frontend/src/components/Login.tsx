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
import { Link, Navigate } from 'react-router-dom';

import AuthService from '../services/auth.service';
import { Form, Input, Button, message, Alert, Col, Row, Typography, Card } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { T } from '@transifex/react';

const { Text, Title, Paragraph } = Typography;

type Props = {
    setUser: any;
};

type State = {
    successful?: boolean;
    message?: string;
    errors?: any;
    user?: any;
    isLogged?: boolean;
};

class Login extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.state = {
            successful: false,
            message: '',
            errors:[],
            user: null,
            isLogged: false,
        };
    }

    handleLogin(formValue: any) {
        const { email, password } = formValue;
        AuthService.login(email, password)
            .then((response) => {
                const responseMessage = response.data.message;
                const user = response.data.user;

                message.success({
                    content: responseMessage,
                    className: 'success-message',
                });
                localStorage.setItem('user', JSON.stringify(user));
                this.props.setUser(user, true);
                this.setState({
                    successful: true,
                    message: responseMessage,

                    user: user,
                    isLogged: true,
                });
            })
            .catch((error) => {
                this.setState({
                    errors: []
                });
                const response = error.response.data;
                if (response.errors) {
                    const errors = Object.values(response.errors);
                    const err = [];
                    errors.forEach(function (value : any) {
                        const keys = Object.keys(value);
                        keys.forEach(function (key) {
                            err.push(value[key]);
                        });
                    });
                    this.setState({
                        errors: err
                    });
                }

                const responseMessage = response.message;
                this.setState({
                    successful: false,
                    message: responseMessage,
                });
            });
    }

    render() {
        const { successful, message, errors, user, isLogged } = this.state;
        const initialValues = {
            email: '',
            password: ''
        };

        if (successful) {
            return <Navigate to="/home" state={{ user: user, isLogged: isLogged }} />;
        }

        return (
            <Row>
                <Col span={8} offset={8} className="section-top">
                    <Card className="form-content">
                        <Paragraph className="form-header text-center">
                            <img className="form-img" src="images/logo_02.png" alt="Logo" />
                            <Title level={4}>
                                {' '}
                                <T _str="Log into Your Account" />
                            </Title>
                        </Paragraph>

                        {errors.length > 0 && !successful && (
                            <Alert
                                type="error"
                                className="alert-msg"
                                message={errors.length > 1 ? (
                                    <ul className="errors-list">
                                        {errors.map((item,index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <T _str={errors.toString()} />
                                )}
                                showIcon
                            />
                        )}
                        {message && !successful && (
                            <Alert type="error" className="alert-msg" message={<T _str={message} />} showIcon />
                        )}

                        <Form
                            layout="vertical"
                            name="login_form"
                            className="login-form"

                            initialValues={initialValues}
                            requiredMark={false}
                            scrollToFirstError={true}
                            validateTrigger="onBlur"

                            onFinish={this.handleLogin}
                        >
                            <Form.Item
                                label={<T _str="Email" />}
                                name="email"
                                rules={[
                                    {
                                        type: 'email',
                                        message: <T _str="Invalid Email" />,
                                    },
                                    {
                                        required: true,
                                        message: <T _str="Email is required" />,
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
                                        message: <T _str="Password must be at least 4 characters" />,
                                    },
                                    {
                                        required: true,
                                        message: <T _str="Password is required" />,
                                    },
                                ]}
                            >
                                <Input.Password
                                    placeholder="**********"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    <T _str="Login" />
                                </Button>
                            </Form.Item>
                        </Form>

                        <Paragraph className="form-footer text-center">
                            <Text>
                                <T _str="Forgot your password ?" />{' '}
                            </Text>
                            <Link to={'/reset-password'}>
                                <T _str="Reset here" />{' '}
                            </Link>
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default Login;
