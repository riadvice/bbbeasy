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
import { Link, useParams } from 'react-router-dom';
import AuthService from '../services/auth.service';

import { Form, Input, Button, message, Alert, Col, Row, Typography, Card, Result } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { T } from '@transifex/react';
import authService from '../services/auth.service';
const { Title, Paragraph } = Typography;
import ReactDOMServer from 'react-dom/server';
import PageNotFound from './PageNotFound';

type Props = {};

type State = {
    password?: string;
    email?: string;
    successful?: boolean;
    message?: string;
    available_token?: boolean;
};

class ChangePassword extends Component<Props, State> {
    constructor(props) {
        const params = new URLSearchParams(window.location.search);

        authService
            .getResetTokenPasswordByToken(params.get('token'))
            .then((response) => {
                this.setState({
                    available_token: true,
                });
            })
            .catch((error) => {
                this.setState({
                    available_token: false,
                    message: error.response.data.message,
                });
            });

        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.state = {
            password: '',
            email: '',
            successful: false,
            message: '',
        };
    }

    handleChange(formValue: any) {
        const { password } = formValue;

        const params = new URLSearchParams(window.location.search);

        AuthService.change_password(params.get('token'), password)
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
                    available_token: false,
                });
            });
    }

    render() {
        const { successful, message, available_token } = this.state;
        const initialValues = {
            email: '',

            successful: false,
            message: '',
        };

        return (
            <div>
                {available_token && (
                    <Row>
                        {successful ? (
                            <Col span={10} offset={7} className="section-top">
                                <Result
                                    status="success"
                                    title="Password changed successfully"
                                    extra={
                                        <Link to={'/login'} className="ant-btn ant-btn-lg">
                                            Login now
                                        </Link>
                                    }
                                />
                            </Col>
                        ) : (
                            <Col span={8} offset={8} className="section-top">
                                <Card className="form-content">
                                    <Paragraph className="form-header text-center">
                                        <img className="form-img" src="images/logo_02.png" alt="Logo" />
                                        <Title level={4}>
                                            {' '}
                                            <T _str="Change password" />
                                        </Title>
                                    </Paragraph>
                                    {message && !successful && (
                                        <Alert
                                            type="error"
                                            className="alert-msg"
                                            message={<T _str={message} />}
                                            showIcon
                                        />
                                    )}

                                    <Form
                                        layout="vertical"
                                        name="login_form"
                                        className="login-form"
                                        initialValues={initialValues}
                                        onFinish={this.handleChange}
                                    >
                                        <Form.Item
                                            label={<T _str="Password" />}
                                            name="password"
                                            hasFeedback
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
                                                    message: (
                                                        <T _str="Confirm password must be at least 4 characters" />
                                                    ),
                                                },
                                                {
                                                    required: true,
                                                    message: <T _str="Confirm password is required" />,
                                                },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('password') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(
                                                            new Error(
                                                                ReactDOMServer.renderToString(
                                                                    <T _str="The two passwords that you entered do not match" />
                                                                )
                                                            )
                                                        );
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input.Password />
                                        </Form.Item>

                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                className="login-form-button"
                                                size="large"
                                                block
                                            >
                                                <T _str="Change password" />
                                            </Button>
                                        </Form.Item>
                                    </Form>

                                    <Paragraph className="form-footer text-center">
                                        <Link to={'/login'}>
                                            <T _str="Back to login" />{' '}
                                        </Link>
                                    </Paragraph>
                                </Card>
                            </Col>
                        )}
                    </Row>
                )}
                {!available_token && <PageNotFound />}
            </div>
        );
    }
}

export default ChangePassword;
