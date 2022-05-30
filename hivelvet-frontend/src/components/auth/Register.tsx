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

import React from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import AddUserForm from '../AddUserForm';

import { Form, Input, Button, Checkbox, Alert, Col, Row, Typography, Card, Result } from 'antd';
import { Trans, withTranslation } from 'react-i18next';
import EN_US from '../../locale/en-US.json';
import { t } from 'i18next';

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
    const initialValues: formType = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreement: false,
    };

    const handleRegistration = (formValue: formType) => {
        AuthService.register(formValue)
            .then((formValue) => {
                console.log('form value', formValue);
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
                            <Link to={'/login'} className="ant-btn ant-btn-lg">
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
                            className="register-form"
                            initialValues={initialValues}
                            requiredMark={false}
                            scrollToFirstError={true}
                            validateTrigger="onSubmit"
                            onFinish={handleRegistration}
                        >
                            <AddUserForm />
                            <Form.Item
                                label={<Trans i18nKey="confirm-password.label" />}
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
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
                                            return Promise.reject(new Error(t('paswords-not-match')));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="**********" />
                            </Form.Item>
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
