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
import { Trans, withTranslation } from 'react-i18next';
import EN_US from '../locale/en-US.json';
import { t } from 'i18next';
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
            errors: [],
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
                if (response.data.username && response.data.email && response.data.role) {
                    const user_infos = {
                        username: response.data.username,
                        email: response.data.email,
                        role: response.data.role,
                    };
                    message.success({
                        content: <Trans i18nKey="welcome" /> + ' ' + user_infos.username + ' !',
                        className: 'success-message',
                    });
                    localStorage.setItem('user', JSON.stringify(user_infos));
                    this.props.setUser(user_infos, true);
                    this.setState({
                        successful: true,
                        user: user_infos,
                        isLogged: true,
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    errors: [],
                });
                const response = error.response.data;
                if (response.errors) {
                    const errors = Object.values(response.errors);
                    const err = '';
                    errors.forEach(function (value: any) {
                        const keys = Object.keys(value);
                        keys.forEach(function (key) {
                            err + value[key];
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
        const { successful, message, errors, user, isLogged } = this.state;
        const initialValues = {
            email: '',
            password: '',
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
                                <Trans i18nkey="log_into_account" />
                            </Title>
                        </Paragraph>

                        {message && !successful && (
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
                            name="login_form"
                            className="login-form"
                            initialValues={initialValues}
                            requiredMark={false}
                            scrollToFirstError={true}
                            validateTrigger="onSubmit"
                            onFinish={this.handleLogin}
                        >
                            <Form.Item
                                label={<Trans i18nKey="email.label" />}
                                name="email"
                               
                                 rules={[
                                    {
                                        type: 'email',
                                        message:  <Trans i18nKey="email.invalid" />,
                                    },
                                    {
                                        required: true,
                                         message: <Trans i18nKey="email.required" />,
                                    },
                                ]}  
                            >
                               
 
                    
                                <Input placeholder={t("email.label")} />
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
                                <Input.Password placeholder="**********" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    <Trans i18nKey="login" />
                                </Button>
                            </Form.Item>
                        </Form>

                        <Paragraph className="form-footer text-center">
                            <Text>
                                <Trans i18nKey="forgot-password" />?{' '}
                            </Text>
                            <Link to={'/reset-password'}>
                                <Trans i18nKey="reset-here" />{' '}
                            </Link>
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default withTranslation()(Login);
