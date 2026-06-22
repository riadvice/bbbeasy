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

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import Notifications from '../Notifications';

import { Form, Button, Alert, Col, Row, Typography, Card } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import { Trans, withTranslation, useTranslation } from 'react-i18next';
import EN_US from '../../locale/en-US.json';
import AddUserForm from '../AddUserForm';
import { UserType } from '../../types/UserType';
import { SessionType } from '../../types/SessionType';
import { UserContext } from '../../lib/UserContext';
import settingsService from 'services/settings.service';
import { SettingsType } from 'types/SettingsType';

const { Text, Title, Paragraph } = Typography;

type formType = {
    email: string;
    password: string;
};

const Login: React.FC = () => {
    const { t } = useTranslation();
    const { setIsLogged, setCurrentUser, setCurrentSession } = useContext(UserContext);
    const [successful, setSuccessful] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [logo, setLogo] = useState<string>('');

    const initialValues: formType = {
        email: '',
        password: '',
    };

    useEffect(() => {
        settingsService
            .collect_settings()
            .then((response) => {
                const settings: SettingsType = response.data;
                setLogo(settings.logo);
            })
            .catch((error) => {
                console.error('Error fetching settings:', error);
            });
    }, []);

    const handleLogin = (formValue: formType) => {
        const { email, password } = formValue;
        setEmail(email);
        AuthService.login(email, password)
            .then((response) => {
                const { user, session } = response.data;
                if (user && session) {
                    const userInfos: UserType = user;
                    const sessionInfos: SessionType = session;

                    Notifications.openNotificationWithIcon(
                        'success',
                        <>
                            <Trans i18nKey="welcome-app" /> {' ' + userInfos.username + ' !'}
                        </>,
                        <SmileOutlined className="text-color-primary" />,
                        2.5
                    );
                    AuthService.addCurrentUser(userInfos);
                    AuthService.addCurrentSession(sessionInfos);
                    setCurrentUser(userInfos);
                    setCurrentSession(sessionInfos);
                    setIsLogged(true);
                    setSuccessful(true);
                }
            })
            .catch((error) => {
                const responseData = error.response?.data;
                if (responseData?.message) {
                    setSuccessful(false);
                    setMessage(responseData.message);
                } else {
                    console.error('Login error:', error);
                }
            });
    };

    const handleReset = () => {
        AuthService.reset_password(email)
            .then((response) => {
                const responseMessage = response.data.message;
                Notifications.openNotificationWithIcon(
                    'success',
                    <Trans
                        i18nKey={Object.keys(EN_US).find((elem) => EN_US[elem] === responseMessage) || 'default-key'}
                    />
                );
            })
            .catch((error) => {
                console.error('Reset password error:', error);
            });
    };

    return (
        <Row>
            <Col span={8} offset={8} className="section-top">
                <Card className="form-content">
                    <Paragraph className="form-header text-center">
                        <img
                            className="form-img"
                            src={logo ? `${process.env.REACT_APP_API_URL}/${logo}` : '/images/logo_02.png'}
                            alt="Logo"
                        />
                        <Title level={4}>
                            <Trans i18nKey="log-into-account" />
                        </Title>
                    </Paragraph>

                    {message && !successful && (
                        <Alert
                            type="error"
                            className="alert-msg"
                            message={
                                (message.startsWith('Invalid credentials') && t('invalid_credentials')) ||
                                (message.startsWith('Your account has been locked') && (
                                    <>
                                        {t('attempts_exceeded')}
                                        <a onClick={handleReset}>{t('click_here')}</a> {t('email_instructions')}
                                    </>
                                )) || (
                                    <Trans
                                        i18nKey={
                                            Object.keys(EN_US).find((elem) => EN_US[elem] === message) || 'default-key'
                                        }
                                    />
                                )
                            }
                            showIcon
                        />
                    )}

                    <Form
                        layout="vertical"
                        name="login_form"
                        initialValues={initialValues}
                        requiredMark={false}
                        scrollToFirstError
                        validateTrigger="onSubmit"
                        onFinish={handleLogin}
                        onValuesChange={() => setMessage('')}
                    >
                        <AddUserForm isLogin={true} />
                        <Form.Item>
                            <Button type="primary" id="submit-btn" htmlType="submit" block>
                                <Trans i18nKey="login" />
                            </Button>
                        </Form.Item>
                    </Form>

                    <Paragraph className="form-footer text-center">
                        <Text>
                            <Trans i18nKey="forgot-password" />{' '}
                        </Text>
                        <Link to={'/reset-password'}>
                            <Trans i18nKey="reset-here" />
                        </Link>
                    </Paragraph>
                </Card>
            </Col>
        </Row>
    );
};

export default withTranslation()(Login);
