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

import { Form, Input, Typography } from 'antd';
import { T } from '@transifex/react';
const { Title, Paragraph } = Typography;

type Props = {
    errors: {};
};

export const Step1Form = (props: Props) => {
    const { errors } = props;

    return (
        <div>
            <Paragraph className="form-header text-center">
                <Title level={4}>
                    <T _str="Create an administrator account" />
                </Title>
            </Paragraph>
            <Form.Item
                label={<T _str="Username" />}
                name="username"
                {...(('username' in errors) && {
                    help: errors['username'],
                    validateStatus: "error"
                })}
                rules={[
                    {
                        required: true,
                        message: <T _str="Username is required" />,
                    },
                    {
                        min: 4,
                        message: <T _str="Username must be at least 4 characters" />,
                    }
                ]}
            >
                <Input placeholder="Username" />
            </Form.Item>

            <Form.Item
                label={<T _str="Email" />}
                name="email"
                {...(('email' in errors) && {
                    help: errors['email'],
                    validateStatus: "error"
                })}
                rules={[
                    {
                        required: true,
                        message: <T _str='Email is required' />,
                    },
                    {
                        type: 'email',
                        message: <T _str='Email is invalid' />,
                    }
                ]}
            >
                <Input placeholder="Email" />
            </Form.Item>
            <Form.Item
                label={<T _str="Password" />}
                name="password"
                {...(('password' in errors) && {
                    help: errors['password'],
                    validateStatus: "error"
                })}
                rules={[
                    {
                        min: 4,
                        message: <T _str='Password must be at least 4 characters' />,
                    },
                    {
                        required: true,
                        message: <T _str='Password is required' />,
                    },
                ]}
            >
                <Input.Password placeholder="Password"/>
            </Form.Item>
        </div>
    );
};