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
import { Form, Input } from 'antd';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';
import InputColor from './layout/InputColor';

type Props = {
    isLogin?: boolean;
    errors?: string[];
    defaultColor: string;
};

export const AddLabelForm = (props: Props) => {
    const { errors, defaultColor } = props;

    return (
        <>
            {!props.isLogin && (
                <Form.Item
                    label={<Trans i18nKey="name.label" />}
                    name="name"
                    {...('name' in errors && {
                        help: <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errors['name'])} />,
                        validateStatus: 'error',
                    })}
                    rules={[
                        {
                            required: true,
                            message: <Trans i18nKey="name.required" />,
                        },
                        {
                            min: 1,
                            message: <Trans i18nKey="label_name.size" />,
                        },
                    ]}
                >
                    <Input placeholder={t('name.label')} />
                </Form.Item>
            )}
            <Form.Item label={<Trans i18nKey="description.label" />} name="description">
                <Input placeholder={t('description.label')} />
            </Form.Item>
            <Form.Item
                label={<Trans i18nKey="color.label" />}
                name="color"
                {...('color' in errors && {
                    help: <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errors['color'])} />,
                    validateStatus: 'error',
                })}
            >
                <InputColor defaultColor={defaultColor} />
            </Form.Item>
        </>
    );
};
export default withTranslation()(AddLabelForm);
