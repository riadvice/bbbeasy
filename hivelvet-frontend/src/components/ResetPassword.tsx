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
import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/auth.service';
import '../App.css';
//import 'antd/dist/antd.css';
import { Form, Input, Button, Checkbox, message, Alert, Col, Row, Typography, Space } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { locale } from 'moment';
import { T } from '@transifex/react';
const { Text, Title, Paragraph } = Typography;

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
        /* this.handleLogin = this.handleLogin.bind(this);
         this.state = {
             email: '',
             
             successful: false,
             message: '',
         };*/
    }

    handleReset(formValue: any) {
        const { email } = formValue;
        console.log(email);
        AuthService.reset_password(email)
            .then((response) => {
                console.log(response);
                const responseMessage = response.data.message;
                console.log(responseMessage);
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
                // const user = response.data.user;
                // localStorage.setItem('user', JSON.stringify(user));
            })
            .catch((error) => {
                console.log(error);
                const responseMessage = error.response.data.message;
                console.log(responseMessage);
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
                    <Paragraph className="pricing-header text-center">
                        <Title style={{ fontWeight: 500 }}>
                            {' '}
                            <T _str="Reset Password" />
                        </Title>
                    </Paragraph>
                    <Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>
                        <Paragraph className="pricing-table page-login">
                            <Paragraph className="pricing-table-inner is-revealing">
                                {message && !successful && (
                                    <Alert
                                        style={{ marginBottom: 24 }}
                                        message="Error"
                                        description={<T _str={message} />}
                                        type="error"
                                        showIcon
                                    />
                                )}
                                <Form
                                    layout="vertical"
                                    name="normal_login"
                                    className="login-form"
                                    initialValues={initialValues}
                                    onFinish={this.handleReset}
                                >
                                    <Form.Item
                                        label={<T _str="Email" />}
                                        name="email"
                                        hasFeedback
                                        rules={[
                                            {
                                                type: 'email',
                                                message: 'Email is invalid',
                                            },
                                            {
                                                required: true,
                                                message: 'Email is required',
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="login-form-button"
                                            size="large"
                                        >
                                            <T _str="Submit" />
                                        </Button>
                                    </Form.Item>
                                </Form>
                                <Paragraph className="text-center mt-12">
                                    <Text style={{ color: 'white' }}>
                                        <T _str="I remember my password" />{' '}
                                    </Text>
                                    <Link to={'/login'} className="login-link">
                                        <T _str="Back to login" />{' '}
                                    </Link>
                                </Paragraph>
                            </Paragraph>
                        </Paragraph>
                    </Space>
                </Col>
            </Row>
        );
    }
}

export default Reset;
