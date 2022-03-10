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

import { message, Form, Input, Typography, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import ColorPicker from 'rc-color-picker/lib/ColorPicker';
import { RcFile } from 'antd/lib/upload';
import { Trans, useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

type Props = {
    errors: {};
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    addColor: string;
    setPrimaryColor: any;
    setSecondaryColor: any;
    setAccentColor: any;
    setAddColor: any;
    setFile: any;
};

export const Step2Form = (props: Props) => {
    const { t } = useTranslation();
    const { errors, primaryColor, secondaryColor, accentColor, addColor, setPrimaryColor, setSecondaryColor, setAccentColor, setAddColor, setFile } = props;
    const [fileList, setFileList] = React.useState();

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };
    const handleChangeFile = (info: any) => {
        let fileList: any = [...info.fileList];
        fileList = fileList.slice(-1);
        const img =
            fileList[0].type === 'image/jpg' ||
            fileList[0].type === 'image/jpeg' ||
            fileList[0].type === 'image/png';
        if (img) {
            setFileList(fileList);
            setFile(fileList[0]);
        }
    };

    return (
        <div className="company-container">
            <div className="box">
                <Paragraph className="form-header">
                    <Title level={4}>
                        <Trans i18nKey="company.label" />
                    </Title>
                </Paragraph>
                <Form.Item
                    label={<Trans i18nKey="company.name" />}
                    name="company_name"
                    {...('company_name' in errors) && {
                        help: errors['company_name'],
                        validateStatus: "error"
                    }}
                    rules={[
                        {
                            required: true,
                            message: <Trans i18nKey="company.required" />,
                        },
                    ]}
                >
                    <Input placeholder={t('company.name')} />
                </Form.Item>
                <Form.Item
                    label={<Trans i18nKey="company.website.label" />}
                    name="company_url"
                    {...('company_url' in errors) && {
                        help: errors['company_url'],
                        validateStatus: "error"
                    }}
                    rules={[
                        {
                            required: true,
                            message: <Trans i18nKey="company.website.required" />,
                        },
                        {
                            type: 'url',
                            message: <Trans i18nKey="company.website.invalid" />,
                        },
                    ]}
                >
                    <Input placeholder={t('company.website.label')} />
                </Form.Item>
                <Form.Item
                    label={<Trans i18nKey="platform.label" />}
                    name="platform_name"
                    {...('platform_name' in errors) && {
                        help: errors['platform_name'],
                        validateStatus: "error"
                    }}
                    rules={[
                        {
                            required: true,
                            message: <Trans i18nKey="platform.required" />,
                        },
                    ]}
                >
                    <Input placeholder={t('platform.label')} />
                </Form.Item>
                <Form.Item
                    label={<Trans i18nKey="terms_url.label" />}
                    name="term_url"
                    {...('term_url' in errors) && {
                        help: errors['term_url'],
                        validateStatus: "error"
                    }}
                    rules={[
                        {
                            type: 'url',
                            message: <Trans i18nKey="terms_url.invalid" />,
                        },
                    ]}
                >
                    <Input placeholder={t('terms_url.label')} />
                </Form.Item>
                <Form.Item
                    label={<Trans i18nKey="privacy_policy_url.label" />}
                    name="policy_url"
                    {...('policy_url' in errors) && {
                        help: errors['policy_url'],
                        validateStatus: 'error',
                    }}
                    rules={[
                        {
                            type: 'url',
                            message: <Trans i18nkey="privacy_policy_url.invalid" />,
                        },
                    ]}
                >
                    <Input placeholder={t('privacy_policy_url.label')} />
                </Form.Item>
            </div>
            <div className="box last">
                <Paragraph className="form-header">
                    <Title level={4}>
                        <Trans i18nKey="branding" />
                    </Title>
                </Paragraph>
                <Form.Item>
                    <Form.Item valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                        <Dragger
                            name="logo"
                            showUploadList={{ showRemoveIcon: false }}
                            fileList={fileList}
                            accept=".png,.jpg,.jpeg"
                            onChange={(info) => {
                                handleChangeFile(info);
                            }}
                            beforeUpload={(file: RcFile) => {
                                if (
                                    file.type === 'image/jpg' ||
                                    file.type === 'image/png' ||
                                    file.type === 'image/jpeg'
                                ) {
                                    message.success(t('success-_upload'));
                                    return false;
                                }
                                message.error(t('wrong_file'));
                                return null;
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <Text strong className="ant-upload-text">
                                <Trans i18nKey="drop-logo-here" />
                            </Text>
                            <p className="ant-upload-hint">.png .jpg .jpeg ...</p>
                        </Dragger>
                    </Form.Item>
                </Form.Item>
                <div className="colors-container">
                    <Form.Item label={<Trans i18nKey="primary_color" />}>
                        <ColorPicker
                            animation="slide-up"
                            defaultColor={primaryColor}
                            onClose={(color) => {
                                setPrimaryColor(color.color)
                            }}
                            placement="bottomLeft"
                        >
                            <span className="rc-color-picker-trigger" />
                        </ColorPicker>

                        <span className="color-palette-picker-value">{primaryColor}</span>
                    </Form.Item>
                    <Form.Item label={<Trans i18nKey="secondary_color" />}>
                        <ColorPicker
                            animation="slide-up"
                            defaultColor={secondaryColor}
                            onClose={(color) => {
                                setSecondaryColor(color.color)
                            }}
                            placement="bottomLeft"
                        >
                            <span className="rc-color-picker-trigger" />
                        </ColorPicker>

                        <span className="color-palette-picker-value">{secondaryColor}</span>
                    </Form.Item>
                    <Form.Item label={<Trans i18nKey="accent_color" />}>
                        <ColorPicker
                            animation="slide-up"
                            defaultColor={accentColor}
                            onClose={(color) => {
                                setAccentColor(color.color)
                            }}
                            placement="bottomLeft"
                        >
                            <span className="rc-color-picker-trigger" />
                        </ColorPicker>

                        <span className="color-palette-picker-value">{accentColor}</span>
                    </Form.Item>
                    <Form.Item label={<Trans i18nKey="additional_color" />}>
                        <ColorPicker
                            animation="slide-up"
                            defaultColor={addColor}
                            onClose={(color) => {
                                setAddColor(color.color)
                            }}
                            placement="bottomLeft"
                        >
                            <span className="rc-color-picker-trigger" />
                        </ColorPicker>

                        <span className="color-palette-picker-value">{addColor}</span>
                    </Form.Item>
                </div>
            </div>
        </div>
    );
};
