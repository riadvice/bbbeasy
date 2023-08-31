/**
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';

import { Form, Button, Alert, Col, Row, Typography, Card, Result } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

import { Trans, withTranslation } from 'react-i18next';
import ConfirmPassword from '../ConfirmPassword';
import EN_US from '../../locale/en-US.json';

import { URLSearchParams as _URLSearchParams } from 'url';
import { PasswordInput } from 'antd-password-input-strength';
import settingsService from 'services/settings.service';
import { SettingsType } from 'types/SettingsType';

const { Title, Paragraph } = Typography;

type formType = {
    password: string;
    confirmPassword: string;
};

const ChangePassword = () => {
    const [logo, setLogo] = React.useState<string>('');
    const [successful, setSuccessful] = React.useState<boolean>(false);
    const [message, setMessage] = React.useState<string>('');
    const [availableToken, setAvailableToken] = React.useState<boolean>(false);
    const params: _URLSearchParams = new URLSearchParams(window.location.search);
    const navigate = useNavigate();

    useEffect(() => {
        settingsService
            .collect_settings()
            .then((response) => {
                console.log(response.data);
                const settings: SettingsType = response.data;
                setLogo(settings.logo);
            })
            .catch((error) => {
                console.log(error);
            });
        AuthService.get_reset_password(params.get('token'))
            .then(() => {
                setAvailableToken(true);
            })
            .catch((error) => {
                setAvailableToken(false);
                setMessage(error.response.data.message);
            });
    }, []);
    const handleSubmit = (formValue: formType) => {
        const { password } = formValue;
        AuthService.change_password(params.get('token'), password)
            .then((result) => {
                if (result.data.message == 'New password cannot be the same as your old password') {
                    setSuccessful(false);
                    setMessage(result.data.message);
                } else if (result.data.result == 'success') setSuccessful(true);
            })
            .catch((error) => {
                setSuccessful(false);
                setMessage(error.response.data.message);
            });
    };

    return (
        <>
            {availableToken ? (
                <Row>
                    {successful ? (
                        <Col span={10} offset={7} className="section-top">
                            <Result
                                status="success"
                                icon={<CheckOutlined className="success-install-icon" />}
                                title={<Trans i18nKey="success_change_password" />}
                                extra={
                                    <Button type="primary" onClick={() => navigate('/login')}>
                                        <Trans i18nKey="login-now" />
                                    </Button>
                                }
                            />
                        </Col>
                    ) : (
                        <Col span={8} offset={8} className="section-top">
                            <Card className="form-content">
                                <Paragraph className="form-header text-center">
                                    <img
                                        className="form-img"
                                        src={logo ? process.env.REACT_APP_API_URL + '/' + logo : '/images/logo_02.png'}
                                        alt="Logo"
                                    />
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
                                                i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == message)}
                                            />
                                        }
                                        showIcon
                                    />
                                )}

                                <Form
                                    layout="vertical"
                                    name="change"
                                    requiredMark={false}
                                    scrollToFirstError={true}
                                    validateTrigger="onSubmit"
                                    onFinish={handleSubmit}
                                    onValuesChange={() => setMessage('')}
                                >
                                    <Form.Item
                                        label={<Trans i18nKey="password.label" />}
                                        name="password"
                                        rules={[
                                            {
                                                min: 8,
                                                message: <Trans i18nKey="password.size" />,
                                            },
                                            {
                                                required: true,
                                                message: <Trans i18nKey="password.required" />,
                                            },
                                        ]}
                                    >
                                        <PasswordInput placeholder="**********" />
                                    </Form.Item>
                                    <ConfirmPassword />

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" block>
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
                            <Button className="color-blue" onClick={() => navigate('/')}>
                                <Trans i18nKey="back-home" />
                            </Button>
                        }
                    />
                )
            )}
        </>
    );
};

export default withTranslation()(ChangePassword);
