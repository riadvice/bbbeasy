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
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';

import { Form, Input } from 'antd';
import { UserPasswordForm } from './UserPasswordForm';

type Props = {
    isLogin?: boolean;
    isInstall?: boolean;
    passwordText?: string;
};

export const AddUserForm = (props: Props) => {
    return (
        <>
            {!props.isLogin && (
                <Form.Item
                    label={<Trans i18nKey="username.label" />}
                    name="username"
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
            )}
            <Form.Item
                label={<Trans i18nKey="email.label" />}
                name="email"
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
            {!props.isInstall && <UserPasswordForm passwordText={props.passwordText} />}
        </>
    );
};

export default withTranslation()(AddUserForm);
