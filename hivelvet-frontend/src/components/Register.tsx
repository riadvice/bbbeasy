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
import ReactDOMServer from 'react-dom/server';
import AuthService from '../services/auth.service';

import { Form, Input, Button, Checkbox, Alert, Col, Row, Typography, Card, Result } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { T } from '@transifex/react';
import { Trans } from 'react-i18next';

const { Title, Paragraph } = Typography;
import EN_US from '../locale/en-US.json';
type Props = {};

type State = {
    successful?: boolean;
    message?: string;
    errors?: any;
};

class Register extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.handleRegistration = this.handleRegistration.bind(this);
        this.state = {
            successful: false,
            message: '',
            errors: [],
        };
    }

    handleRegistration(formValue: any) {
        AuthService.register(formValue)
            .then((response) => {
                const responseMessage = response.data.message;
                this.setState({
                    successful: true,
                    message: responseMessage,
                });
            })
            .catch((error) => {
                this.setState({
                    errors: [],
                });
                const response = error.response.data;
                if (response.errors) {
                    const errors = Object.values(response.errors);
                    const err = [];
                    errors.forEach(function (value: any) {
                        const keys = Object.keys(value);
                        keys.forEach(function (key) {
                            err.push(value[key]);
                        });
                    });
                    this.setState({
                        errors: response.errors,
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
        const { successful, message, errors } = this.state;
        const initialValues = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreement: false,
        };

        return (
            <Row>
                {successful ? (
                    <Col span={10} offset={7} className="section-top">
                        <Result
                            status="success"
                            title={<Trans i18nKey="completed_registration" />}
                            subTitle={<Trans i18nKey="user_account_created"> </Trans>}
                            extra={
                                <Link to={'/login'} className="ant-btn ant-btn-lg">
                                    <Trans i18nkey="login-now" />
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
                                    <Trans i18nkey="sign-up" />
                                </Title>
                            </Paragraph>

                            {message && (
                                <Alert
                                    type="error"
                                    className="alert-msg"
                                    message={
                                        <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == message)}>
                                            {' '}
                                        </Trans>
                                    }
                                    showIcon
                                />
                            )}

                            <Form
                                layout="vertical"
                                name="register"
                                className="register-form"
                                initialValues={initialValues}
                                requiredMark={false}
                                scrollToFirstError={true}
                                validateTrigger="onSubmit"
                                onFinish={this.handleRegistration}
                            >
                                <Form.Item
                                    label={<Trans i18nKey="username.label" />}
                                    name="username"
                                    {...('username' in errors && {
                                        help: <Trans i18nKey="username.required_back" />,
                                        validateStatus: 'error',
                                    })}
                                    /* rules={[
                                        {
                                            required: true,
                                            message: <Trans i18nKey="username.required" />,
                                        },
                                    ]}*/
                                >
                                    <Input placeholder="Username" />
                                </Form.Item>
                                <Form.Item
                                    label={<Trans i18nKey="email.label" />}
                                    name="email"
                                    {...('email' in errors && {
                                        help: <Trans i18nKey="email.required_back" />,
                                        validateStatus: 'error',
                                    })}
                                    /*rules={[
                                        {
                                            type: 'email',
                                            message: <Trans i18nKey="email.invalid" />,
                                        },
                                        {
                                            required: true,
                                            message: <Trans i18nKey="email.required" />,
                                        },
                                    ]}*/
                                >
                                    <Input placeholder="Email" />
                                </Form.Item>
                                <Form.Item
                                    label={<Trans i18nKey="password.label" />}
                                    name="password"
                                    {...('password' in errors && {
                                        help: <Trans i18nKey="password.required_back" />,
                                        validateStatus: 'error',
                                    })}
                                    /*  rules={[
                                        {
                                            min: 4,
                                            message: <Trans i18nKey="password.size" />,
                                        },
                                        {
                                            required: true,
                                            message: <Trans i18nKey="password.required" />,
                                        },
                                    ]}*/
                                >
                                    <Input.Password
                                        placeholder="**********"
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label={<Trans i18nKey="confirm-password.label" />}
                                    name="confirmPassword"
                                    dependencies={['password']}
                                    {...('confirmPassword' in errors && {
                                        help: <Trans i18nKey="confirm-password.required_back" />,
                                        validateStatus: 'error',
                                    })}
                                    /*  rules={[
                                        {
                                            min: 4,
                                            message: <Trans i18nKey="confirm-password.size" />,
                                        },
                                        {
                                            required: true,
                                            message: <Trans i18nKey="confirm-password.required" />,
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(
                                                    ReactDOMServer.renderToString(
                                                        <Trans i18nKey="paswords-not-match" />
                                                    )
                                                );
                                            },
                                        }),
                                    ]}*/
                                >
                                    <Input.Password placeholder="**********" />
                                </Form.Item>

                                <Form.Item
                                    className="form-agree"
                                    name="agreement"
                                    valuePropName="checked"
                                    {...('agreement' in errors && {
                                        help: <Trans i18nKey="agreement.required_back" />,
                                        validateStatus: 'error',
                                    })}
                                    /* rules={[
                                        {
                                            validator: (_, value) =>
                                                value
                                                    ? Promise.resolve()
                                                    : Promise.reject(
                                                          new Error(
                                                              ReactDOMServer.renderToString(
                                                                  <Trans i18nKey="accept-agreement" />
                                                              )
                                                          )
                                                      ),
                                        },
                                    ]}*/
                                >
                                    <Checkbox>
                                        <Trans i18nKey="agree" />
                                        <a href="#">
                                            {' '}
                                            <Trans i18nKey="terms" />
                                        </a>{' '}
                                        <Trans i18nKey="and" />
                                        <a href="#">
                                            {' '}
                                            <Trans i18nKey="privacy-policy" />
                                        </a>
                                    </Checkbox>
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" block>
                                        <Trans i18nKey="register" />
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                )}
            </Row>
        );
    }
}

export default Register;
