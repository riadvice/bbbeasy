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
import { Link, useParams } from 'react-router-dom';
import AuthService from '../services/auth.service';
import '../App.css';
//import 'antd/dist/antd.css';
import { Form, Input, Button, Checkbox, message, Alert, Col, Row, Typography, Space, Card } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { locale } from 'moment';
import { T } from '@transifex/react';
import authService from '../services/auth.service';
const { Text, Title, Paragraph } = Typography;
import ReactDOMServer from 'react-dom/server';

type Props = {
    //location:string;
};

type State = {
    password?: string;
    email: string;
    successful: boolean;
    message: string;
    pageexists: boolean;
};

class ChangePassword extends Component<Props, State> {
    constructor(props) {
        const params = new URLSearchParams(window.location.search);
        authService
            .getUser(params.get('token'))
            .then((response) => {
                console.log(response);
                console.log(response.data);
                this.setState({
                    pageexists: true,
                });
            })
            .catch((error) => {
                console.log(error);
                console.log(error.response);
                this.setState({
                    pageexists: false,
                });
            });

        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.state = {
            password: '',
            email: '',
            successful: false,
            message: '',
            pageexists: false,
        };

        /* this.handleLogin = this.handleLogin.bind(this);
          this.state = {
              email: '',
              
              successful: false,
              message: '',
          };*/
    }

    handleChange(formValue: any) {
        const { password, confirmPassword } = formValue;
        console.log(formValue);
        console.log(password, confirmPassword);
        console.log('props', window.location.search);
        const params = new URLSearchParams(window.location.search);
        console.log('params =', params);
        console.log(params.get('token'));

        AuthService.change_password(params.get('token'), password)
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
        const { successful, message, pageexists } = this.state;
        const initialValues = {
            email: '',

            successful: false,
            message: '',
        };

        console.log(pageexists);
        return (
            <Row>
                {pageexists && (
                    <Col span={8} offset={8} className="section-top">
                        <Card className="form-content">
                            <Paragraph className="pricing-header text-center">
                                <Title style={{ fontWeight: 500 }}>
                                    {' '}
                                    <T _str="Change your password" />
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
                                            onFinish={this.handleChange}
                                        >
                                            <Form.Item
                                                label={<T _str="Password" />}
                                                name="password"
                                                hasFeedback
                                                rules={[
                                                    {
                                                        min: 4,
                                                        message: <T _str="Password must be at least 4 characters" />,
                                                    },
                                                    {
                                                        required: true,
                                                        message: <T _str="Password is required" />,
                                                    },
                                                ]}
                                            >
                                                <Input.Password
                                                    iconRender={(visible) =>
                                                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                                    }
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                label={<T _str="Confirm Password" />}
                                                name="confirmPassword"
                                                dependencies={['password']}
                                                hasFeedback
                                                rules={[
                                                    {
                                                        min: 4,
                                                        message: (
                                                            <T _str="Confirm password must be at least 4 characters" />
                                                        ),
                                                    },
                                                    {
                                                        required: true,
                                                        message: <T _str="Confirm password is required" />,
                                                    },
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (!value || getFieldValue('password') === value) {
                                                                return Promise.resolve();
                                                            }
                                                            return Promise.reject(
                                                                new Error(
                                                                    ReactDOMServer.renderToString(
                                                                        <T _str="The two passwords that you entered do not match" />
                                                                    )
                                                                )
                                                            );
                                                        },
                                                    }),
                                                ]}
                                            >
                                                <Input.Password />
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
                                    </Paragraph>
                                </Paragraph>
                            </Space>
                        </Card>
                    </Col>
                )}
                {!pageexists && (
                    <Col span={8} offset={8} className="section-top">
                        <Paragraph className="pricing-header text-center">
                            <Title style={{ fontWeight: 500 }}> </Title>
                        </Paragraph>
                        <Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>
                            <Paragraph className="pricing-table page-login">
                                <Form layout="vertical" name="normal_login" className="login-form">
                                    <h1>Not found</h1>
                                </Form>
                            </Paragraph>
                        </Space>
                    </Col>
                )}
            </Row>
        );
    }
}

export default ChangePassword;
