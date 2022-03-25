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

import { Form, Input, Button, Alert, Col, Row, Typography, Card, Result } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

import authService from '../services/auth.service';
import { Trans, withTranslation } from 'react-i18next';
import EN_US from '../locale/en-US.json';
import { t } from 'i18next';

import { URLSearchParams as _URLSearchParams } from 'url';

const { Title, Paragraph } = Typography;

type formType = {
    password: string;
    confirmPassword: string;
};

type Props = {};
type State = {
    successful?: boolean;
    message?: string;
    available_token?: boolean;
};

class ChangePassword extends Component<Props, State> {
    constructor(props) {
        const params: _URLSearchParams = new URLSearchParams(window.location.search);
        authService
            .getResetPasswordByToken(params.get('token'))
            .then(() => {
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
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            successful: false,
            message: '',
        };
    }

    handleSubmit(formValue: formType) {
        const { password } = formValue;
        const params: _URLSearchParams = new URLSearchParams(window.location.search);
        AuthService.change_password(params.get('token'), password)
            .then(() => {
                this.setState({
                    successful: true,
                });
            })
            .catch((error) => {
                this.setState({
                    successful: false,
                    message: error.response.data.message,
                });
            });
    }

    render() {
        const { successful, message, available_token } = this.state;

        return (
            <>
                {available_token ? (
                    <Row>
                        {successful ? (
                            <Col span={10} offset={7} className="section-top">
                                <Result
                                    status="success"
                                    icon={<CheckOutlined className="success-install-icon" />}
                                    title={<Trans i18nKey="success_change_password" />}
                                    extra={
                                        <Link to={'/login'} className="ant-btn ant-btn-primary ant-btn-lg">
                                            <Trans i18nKey="login-now" />
                                        </Link>
                                    }
                                />
                            </Col>
                        ) : (
                            <Col span={8} offset={8} className="section-top">
                                <Card className="form-content">
                                    <Paragraph className="form-header text-center">
                                        <img className="form-img" src="/images/logo_02.png" alt="Logo" />
                                        <Title level={4}>
                                            <Trans i18nKey="change-password" />
                                        </Title>
                                    </Paragraph>
                                    {message && (
                                        <Alert
                                            type="error"
                                            className="alert-msg"
                                            message={
                                                <Trans
                                                    i18nKey={Object.keys(EN_US).filter(
                                                        (elem) => EN_US[elem] == message
                                                    )}
                                                />
                                            }
                                            showIcon
                                        />
                                    )}

                                    <Form
                                        layout="vertical"
                                        name="change"
                                        className="login-form"
                                        requiredMark={false}
                                        scrollToFirstError={true}
                                        validateTrigger="onSubmit"
                                        onFinish={this.handleSubmit}
                                    >
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
                                        <Form.Item
                                            label={<Trans i18nKey="confirm-password.label" />}
                                            name="confirmPassword"
                                            dependencies={['password']}
                                            rules={[
                                                {
                                                    min: 4,
                                                    message: <Trans i18nKey="password.size" />,
                                                },
                                                {
                                                    required: true,
                                                    message: <Trans i18nKey="password.required" />,
                                                },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('password') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error(t('paswords-not-match')));
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input.Password placeholder="**********" />
                                        </Form.Item>

                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                className="login-form-button"
                                                size="large"
                                                block
                                            >
                                                <Trans i18nKey="change-password" />
                                            </Button>
                                        </Form.Item>
                                    </Form>

                                    <Paragraph className="form-footer text-center">
                                        <Link to={'/login'}>
                                            <Trans i18nKey="back-to-login" />
                                        </Link>
                                    </Paragraph>
                                </Card>
                            </Col>
                        )}
                    </Row>
                ) : (
                    message && (
                        <Result
                            status="500"
                            title="500"
                            subTitle={<Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == message)} />}
                            className="page-not-found"
                            extra={
                                <Link className="ant-btn color-blue" to="/">
                                    <Trans i18nKey="back-home" />
                                </Link>
                            }
                        />
                    )
                )}
            </>
        );
    }
}

export default withTranslation()(ChangePassword);
