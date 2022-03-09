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
import { Form, Input, Button, Checkbox, message, Alert, Col, Row, Typography, Card } from 'antd';
import { Trans, withTranslation } from 'react-i18next';
const { Text, Title, Paragraph } = Typography;
import EN_US from '../locale/en-US.json';
import { t } from 'i18next';
type Props = {};
type State = {
    email?: string;

    successful: boolean;
    message: string;
};

class Reset extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.handleReset = this.handleReset.bind(this);
        this.state = {
            email: '',
            successful: false,
            message: '',
        };
    }

    handleReset(formValue: any) {
        const { email } = formValue;

        AuthService.reset_password(email)
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
                });
            });
    }

    render() {
        const { successful, message } = this.state;
        const initialValues = {
            email: '',

            successful: false,
            message: '',
        };

        return (
            <Row>
                <Col span={8} offset={8} className="section-top">
                    <Card className="form-content">
                        <Paragraph className="form-header text-center">
                            <img className="form-img" src="images/logo_02.png" alt="Logo" />
                            <Title level={4}>
                                {' '}
                                <Trans i18nkey="reset-password" />
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
                            onFinish={this.handleReset}
                        >
                            <Form.Item
                                label={<Trans i18nKey="email.label" />}
                                name="email"
                                hasFeedback
                                rules={[
                                    {
                                        type: 'email',
                                        message: <Trans i18nKey="email.invalid" />,
                                    },
                                    {
                                        required: true,
                                        message: <Trans i18nKey="email.required" />,
                                    },
                                ]}
                            >
                                <Input placeholder={t('email.label')} />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="login-form-button"
                                    size="large"
                                    block
                                >
                                    <Trans i18nKey="reset-password" />
                                </Button>
                            </Form.Item>
                        </Form>

                        <Paragraph className="form-footer text-center">
                            <Text>
                                <Trans i18nKey="remember-password" />{' '}
                            </Text>
                            <Link to={'/login'}>
                                <Trans i18nKey="back-to-login" />{' '}
                            </Link>
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default withTranslation()(Reset);