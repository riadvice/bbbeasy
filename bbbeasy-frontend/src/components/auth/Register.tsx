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
import AddUserForm from '../AddUserForm';
import ConfirmPassword from '../ConfirmPassword';

import { Form, Button, Checkbox, Alert, Col, Row, Typography, Card, Result } from 'antd';
import { Trans, withTranslation } from 'react-i18next';
import EN_US from '../../locale/en-US.json';
import { t } from 'i18next';
import settingsService from 'services/settings.service';
import { SettingsType } from 'types/SettingsType';

const { Title, Paragraph } = Typography;

type formType = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreement: boolean;
};

const Register = () => {
    const [successful, setSuccessful] = React.useState<boolean>(false);
    const [message, setMessage] = React.useState<string>('');
    const [logo, setLogo] = React.useState<string>('');
    const initialValues: formType = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreement: false,
    };
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
        <Row>
            {successful ? (
                <Col span={10} offset={7} className="section-top">
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
                                <Trans i18nKey="sign-up" />
                            </Title>
                        </Paragraph>

                        {message && (
                            <Alert
                                type="error"
                                className="alert-msg"
                                message={
                                    <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == message)} />
                                }
                                showIcon
                            />
                        )}

                        <Form
                            layout="vertical"
                            name="register_form"
                            initialValues={initialValues}
                            requiredMark={false}
                            scrollToFirstError={true}
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
                    </Card>
                </Col>
            )}
        </Row>
    );
};

export default withTranslation()(Register);
