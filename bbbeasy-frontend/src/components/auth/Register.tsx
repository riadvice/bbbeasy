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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';

import { useSettings } from 'lib/SettingsContext';
import AddUserForm from '../AddUserForm';
import ConfirmPassword from '../ConfirmPassword';

import { Form, Button, Checkbox, Alert, Col, Row, Typography, Card, Result } from 'antd';
import { Trans, withTranslation } from 'react-i18next';
import EN_US from '../../locale/en-US.json';
import { t } from 'i18next';
import { apiRoutes } from '../../routing/backend-config';

const { Title, Paragraph } = Typography;

type formType = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreement: boolean;
};

const Register = () => {
    const { settings } = useSettings();
    const [successful, setSuccessful] = React.useState<boolean>(false);
    const [message, setMessage] = React.useState<string>('');
    const initialValues: formType = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreement: false,
    };

    const navigate = useNavigate();

    const handleRegistration = (formValue: formType) => {
        AuthService.register(formValue)
            .then(() => {
                setSuccessful(true);
            })
            .catch((error) => {
                const responseData = error.response.data;
                setSuccessful(false);
                setMessage(responseData.message);
            });
    };

    return (
        <Row className="login-page login-layout register-page">
            <Col xs={24} lg={12} className="login-hero-column">
                <div className="login-hero">
                    <div className="login-hero-tag">
                        <span className="login-hero-tag-line" />
                        <span>
                            <Trans i18nKey="sign-up-hero-tag" />
                        </span>
                    </div>

                    <Title level={1} className="login-hero-title">
                        <span className="login-hero-title-main">
                            <Trans i18nKey="sign-up-hero-title-main" />
                        </span>
                        <span className="login-hero-title-accent">
                            <Trans i18nKey="sign-up-hero-title-accent" />
                        </span>
                    </Title>

                    <Paragraph className="login-hero-description">
                        <Trans i18nKey="sign-up-hero-description" />
                    </Paragraph>

                    <div className="login-hero-points">
                        <div className="login-hero-point">
                            <span className="login-hero-point-icon">✓</span>
                            <span>
                                <Trans i18nKey="sign-up-hero-point-1" />
                            </span>
                        </div>
                        <div className="login-hero-point">
                            <span className="login-hero-point-icon">✓</span>
                            <span>
                                <Trans i18nKey="sign-up-hero-point-2" />
                            </span>
                        </div>
                        <div className="login-hero-point">
                            <span className="login-hero-point-icon">✓</span>
                            <span>
                                <Trans i18nKey="sign-up-hero-point-3" />
                            </span>
                        </div>
                    </div>
                </div>
            </Col>

            <Col xs={24} lg={10} className="section-top login-form-column">
                <Card className="form-content">
                    {successful ? (
                        <Result
                            status="success"
                            title={<Trans i18nKey="completed_registration" />}
                            subTitle={<Trans i18nKey="user_account_created" />}
                            extra={
                                <Button onClick={() => navigate('/login')}>
                                    <Trans i18nKey="login-now" />
                                </Button>
                            }
                        />
                    ) : (
                        <>
                            <Paragraph className="form-header text-center">
                                <img
                                    className="form-img"
                                    src={
                                        settings?.logo ? apiRoutes.GET_FILE_URL + settings.logo : '/images/logo_02.png'
                                    }
                                    alt="Logo"
                                />
                                <Title level={4}>
                                    <Trans i18nKey="sign-up" />
                                </Title>
                            </Paragraph>

                            {message && (
                                <Alert
                                    type="error"
                                    className="alert-msg"
                                    message={
                                        <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] === message)} />
                                    }
                                    showIcon
                                />
                            )}

                            <Form
                                layout="vertical"
                                name="register_form"
                                initialValues={initialValues}
                                requiredMark={false}
                                scrollToFirstError
                                validateTrigger="onSubmit"
                                onFinish={handleRegistration}
                                onValuesChange={() => setMessage('')}
                            >
                                <AddUserForm />
                                <ConfirmPassword />
                                <Form.Item
                                    className="form-agree"
                                    name="agreement"
                                    valuePropName="checked"
                                    rules={[
                                        {
                                            validator: (_, value) =>
                                                value
                                                    ? Promise.resolve()
                                                    : Promise.reject(new Error(t('accept-agreement'))),
                                        },
                                    ]}
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
                                    <Button type="primary" id="submit-btn" htmlType="submit" block>
                                        <Trans i18nKey="register" />
                                    </Button>
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </Card>
            </Col>
        </Row>
    );
};

export default withTranslation()(Register);
