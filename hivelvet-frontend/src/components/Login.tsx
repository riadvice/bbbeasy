import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';

import AuthService from '../services/auth.service';
import { Form, Input, Button, message, Alert, Col, Row, Typography, Card } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { T } from '@transifex/react';
const { Text, Title, Paragraph } = Typography;

type Props = {};
type State = {
    email?: string;
    password?: string;
    successful: boolean;
    message: string;
};

class Login extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.state = {
            email: '',
            password: '',
            successful: false,
            message: '',
        };
    }

    handleLogin(formValue: any) {
        const { email, password } = formValue;
        AuthService.login(email, password)
            .then((response) => {
                const responseMessage = response.data.message;
                message.success({
                    content: responseMessage,
                    className: 'success-message',
                });
                this.setState({
                    successful: true,
                    message: responseMessage,
                });
                const user = response.data.user;
                localStorage.setItem('user', JSON.stringify(user));
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
            password: '',
            successful: false,
            message: '',
        };

        if (successful) {
            return <Navigate to="/home" />;
        }

        return (
            <Row>
                <Col span={8} offset={8} className="section-top">
                    <Card className="form-content">
                        <Paragraph className="form-header text-center">
                            <img className="form-img" src="images/logo_02.png" alt="Logo" />
                            <Title level={4}>
                                {' '}
                                <T _str="Log into Your Account" />
                            </Title>
                        </Paragraph>

                        {message && !successful && (
                            <Alert type="error" className="alert-msg" message={<T _str={message} />} showIcon />
                        )}

                        <Form
                            layout="vertical"
                            name="login_form"
                            className="login-form"
                            initialValues={initialValues}
                            onFinish={this.handleLogin}
                        >
                            <Form.Item
                                label={<T _str="Email" />}
                                name="email"
                                hasFeedback
                                rules={[
                                    {
                                        type: 'email',
                                        message: <T _str="Invalid Email" />,
                                    },
                                    {
                                        required: true,
                                        message: <T _str="Email is required" />,
                                    },
                                ]}
                            >
                                <Input placeholder="Email" />
                            </Form.Item>
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
                                    placeholder="Password"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    <T _str="Login" />
                                </Button>
                            </Form.Item>
                        </Form>

                        <Paragraph className="form-footer text-center">
                            <Text>
                                <T _str="Forgot your password ?" />{' '}
                            </Text>
                            <Link to={'/reset-password'}>
                                <T _str="Reset here" />{' '}
                            </Link>
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default Login;
