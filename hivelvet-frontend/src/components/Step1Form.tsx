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
import { Trans, useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

type Props = {
    errors: {};
};

export const Step1Form = (props: Props) => {
    const { t } = useTranslation();
    const { errors } = props;

    return (
        <div>
            <Paragraph className="form-header text-center">
                <Title level={4}>
                    <Trans i18nKey="create-administrator-account" />
                </Title>
            </Paragraph>

            <Form.Item
                label={<Trans i18nKey="username.label" />}
                name="username"
                {...('username' in errors) && {
                    help: errors['username'],
                    validateStatus: "error"
                }}
                rules={[
                    {
                        required: true,
                        message: <Trans i18nKey="username.required" />,
                    },
                    {
                        min: 4,
                        message: <Trans i18nKey="username.size" />,
                    },
                ]}
            >
                <Input placeholder={t('username.label')} />
            </Form.Item>
            <Form.Item
                label={<Trans i18nKey="email.label" />}
                name="email"
                {...('email' in errors) && {
                    help: errors['email'],
                    validateStatus: "error"
                }}
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
            <Form.Item
                label={<Trans i18nKey="password.label" />}
                name="password"
                {...('password' in errors) && {
                    help: errors['password'],
                    validateStatus: 'error'
                }}
                rules={[
                    {
                        min: 4,
                        message: <Trans i18nKey="password.size" />,
                    },
                    {
                        required: true,
                        message: <Trans i18nKey="password.required" />,
                    },
                ]}
            >
                <Input.Password placeholder={t('password.label')} />
            </Form.Item>
        </div>
    );
};