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
import { Link, Navigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import Notifications from '../Notifications';

import { Form, Button, Alert, Col, Row, Typography, Card } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import { Trans, withTranslation } from 'react-i18next';
import EN_US from '../../locale/en-US.json';
import AddUserForm from '../AddUserForm';
import { UserType } from '../../types/UserType';
import { UserContext } from '../../lib/UserContext';

const { Text, Title, Paragraph } = Typography;

type formType = {
    email: string;
    password: string;
};

const Login = () => {
    const { setIsLogged, setCurrentUser } = React.useContext(UserContext);
    const [successful, setSuccessful] = React.useState<boolean>(false);
    const [message, setMessage] = React.useState<string>('');
    const initialValues: formType = {
        email: '',
        password: '',
    };

    const handleLogin = (formValue: formType) => {
        const { email, password } = formValue;
        AuthService.login(email, password)
            .then((response) => {
                if (response.data.username && response.data.email && response.data.role) {
                    const user_infos: UserType = {
                        id: response.data.id,
                        username: response.data.username,
                        email: response.data.email,
                        role: response.data.role,
                    };

                    Notifications.openNotificationWithIcon(
                        'success',
                        <>
                            <Trans i18nKey="welcome" /> {' ' + user_infos.username + ' !'}
                        </>,
                        <SmileOutlined className="text-color-primary" />,
                        2.5
                    );
                    localStorage.setItem('user', JSON.stringify(user_infos));
                    setCurrentUser(user_infos);
                    setIsLogged(true);
                    setSuccessful(true);
                }
            })
            .catch((error) => {
                const responseData = error.response.data;
                if (responseData.message) {
                    setSuccessful(false);
                    setMessage(responseData.message);
                }
            });
    };

    if (successful) {
        return <Navigate to="/home" />;
    }
    return (
        <Row>
            <Col span={8} offset={8} className="section-top">
                <Card className="form-content">
                    <Paragraph className="form-header text-center">
                        <img className="form-img" src="/images/logo_02.png" alt="Logo" />
                        <Title level={4}>
                            <Trans i18nKey="log-into-account" />
                        </Title>
                    </Paragraph>

                    {message && !successful && (
                        <Alert
                            type="error"
                            className="alert-error-msg"
                            message={<Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == message)} />}
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
                        onFinish={handleLogin}
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
