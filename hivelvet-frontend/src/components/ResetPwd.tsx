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

import { Form, Input, Button, Col, Row, Typography, Card } from 'antd';
import { T } from '@transifex/react';
const { Text, Title, Paragraph } = Typography;

type Props = {};
type State = {
    email?: string;
};

class ResetPwd extends Component<Props, State> {
    render() {
        const initialValues = {
            email: ''
        };

        return (
            <Row>
                <Col span={8} offset={8} className="section-top">
                    <Card className="form-content">
                        <Paragraph className="form-header text-center">
                            <img className="form-img" src="images/logo_02.png" alt="Logo"/>
                            <Title level={4}>
                                {' '}
                                <T _str="Reset my password" />
                            </Title>
                        </Paragraph>
                            <Form
                                layout="vertical"
                                name="login_form"
                                className="login-form"
                                initialValues={initialValues}
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
                                    <Input placeholder="Email" />
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="login-form-button"
                                        size="large"
                                        block
                                    >
                                        <T _str="Reset password" />
                                    </Button>
                                </Form.Item>
                            </Form>

                        <Paragraph className="form-footer text-center">
                            <Text>
                                <T _str="I remember my password" />{' '}
                            </Text>
                            <Link to={'/login'}>
                                <T _str="Back to login" />{' '}
                            </Link>
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        );
    }
}

export default ResetPwd;
