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
import { Trans, useTranslation, withTranslation } from 'react-i18next';

import { message, Form, Input, Typography, Upload, InputNumber, theme, ColorPicker, Space } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import type { Color } from 'antd/es/color-picker';
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
import { Switch } from 'antd';
type brandColorFunction = (brand_color: string) => void;
type defaultFontSizeFunction = (default_font_size: number) => void;
type borderRadiusFunction = (border_radius: number) => void;
type wireframeFunction = (wireframe_style: boolean) => void;
type fileFunction = (file: UploadFile) => void;
type fileListFunction = (fileList: UploadFile[]) => void;

type Props = {
    brandColor: string;
    defaultFontSize: number;
    borderRadius: number;
    wireframeStyle: boolean;
    setBrandColor: brandColorFunction;
    setDefaultFontSize: defaultFontSizeFunction;
    setBorderRadius: borderRadiusFunction;
    setWireframeStyle: wireframeFunction;
    setFile: fileFunction;
    fileList: UploadFile[];
    setFileList: fileListFunction;
};

export const Step2Form = (props: Props) => {
    const { t } = useTranslation();
    const {
        brandColor,
        defaultFontSize,
        borderRadius,
        wireframeStyle,
        setBrandColor,
        setDefaultFontSize,
        setBorderRadius,
        setWireframeStyle,
        setFile,
        fileList,
        setFileList,
    } = props;
    const { token } = theme.useToken();
    const normFile = (e: UploadChangeParam<UploadFile<string>>) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };
    const handleChangeFile = (info: UploadChangeParam<UploadFile<string>>) => {
        let fileList: UploadFile[] = [...info.fileList];

        fileList = fileList.slice(-1);
        if (fileList[0] != undefined) {
            const img: boolean =
                fileList[0].type === 'image/jpg' ||
                fileList[0].type === 'image/jpeg' ||
                fileList[0].type === 'image/png';
            if (img) {
                setFileList(fileList);

                fileList[0].name = 'logo-' + Date.now() + '.' + fileList[0].type.substring(6);

                setFile(fileList[0]);
            }
        }
    };
    const onChangeDefaultSize = (value) => {
        setDefaultFontSize(value);
    };
    const onChangeBorderRadius = (value) => {
        setBorderRadius(value);
    };
    const onChangeWireframeStyle = (checked: boolean) => {
        setWireframeStyle(checked);
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
                            className="dragger"
                            name="logo"
                            multiple={false}
                            showUploadList={{ showRemoveIcon: true }}
                            fileList={fileList}
                            accept=".png,.jpg,.jpeg"
                            beforeUpload={(file: RcFile) => {
                                if (
                                    !(
                                        file.type === 'image/jpg' ||
                                        file.type === 'image/png' ||
                                        file.type === 'image/jpeg'
                                    )
                                ) {
                                    message.error(t('wrong_file'));
                                    return null;
                                }

                                return false;
                            }}
                            onChange={(info) => {
                                handleChangeFile(info);
                            }}
                            onRemove={() => {
                                setFileList(null);
                                setFile(null);
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <Text strong>
                                <Trans i18nKey="drop-logo-here" />
                            </Text>
                            <p className="ant-upload-hint">.png .jpg .jpeg ...</p>
                        </Dragger>
                    </Form.Item>
                </Form.Item>
                <div className="colors-container">
                    <Form.Item label={<Trans i18nKey="brand_color" />}>
                        <ColorPicker
                            value={brandColor}
                            onChange={(color1: Color) => {
                                if (typeof color1 === 'string') {
                                    setBrandColor(color1);
                                } else {
                                    setBrandColor(color1.toHexString());
                                }
                            }}
                        >
                            <Space className="space-color-picker-branding">
                                <div
                                    style={{
                                        width: token.sizeMD,
                                        height: token.sizeMD,
                                        borderRadius: token.borderRadiusSM,
                                        backgroundColor: brandColor,
                                    }}
                                />
                                <span>{brandColor}</span>
                            </Space>
                        </ColorPicker>
                    </Form.Item>
                    <Form.Item label={<Trans i18nKey="default_font_size" />}>
                        <InputNumber min={1} max={30} defaultValue={defaultFontSize} onChange={onChangeDefaultSize} />
                    </Form.Item>
                    <Form.Item label={<Trans i18nKey="border_radius" />}>
                        <InputNumber min={1} max={20} defaultValue={borderRadius} onChange={onChangeBorderRadius} />
                    </Form.Item>
                    <Form.Item label={<Trans i18nKey="wireframe_style" />}>
                        <Switch defaultChecked={wireframeStyle} onChange={onChangeWireframeStyle} />
                    </Form.Item>
                </div>
            </div>
        </div>
    );
};
