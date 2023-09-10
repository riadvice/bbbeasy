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

import { Form } from 'antd';
import { PasswordInput } from 'antd-password-input-strength';

type Props = {
    dependOn?: string;
    confirmText?: string;
};

const ConfirmPassword = (props: Props) => {
    const { dependOn, confirmText } = props;

    

    return (
        <Form.Item
            label={<Trans i18nKey={confirmText ?? 'confirm-password.label'} />}
            name={confirmText ?? 'confirmPassword'}
            dependencies={[dependOn ?? 'password']}
            rules={[
                {
                    min: 8,
                    message: <Trans i18nKey="confirm-password.size" />,
                },
                !dependOn && {
                    required: true,
                    message: <Trans i18nKey="confirm-password.required" />,
                },
            
           ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(t('passwords-not-match')));
            },
          }),
        ]}
        >
            <PasswordInput placeholder="**********" />
        </Form.Item>
    );
};

export default withTranslation()(ConfirmPassword);
