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
import { T } from '@transifex/react';

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
                        <T _str="Company" />
                    </Title>
                </Paragraph>
                <Form.Item
                    label={<T _str="Company name" />}
                    name="company_name"
                    {...('company_name' in errors) && {
                        help: errors['company_name'],
                        validateStatus: "error"
                    }}
                    rules={[
                        {
                            required: true,
                            message: <T _str='Company name is required' />,
                        },
                    ]}
                >
                    <Input placeholder="Company name" />
                </Form.Item>

                <Form.Item
                    label={<T _str="Company website" />}
                    name="company_url"
                    {...('company_url' in errors) && {
                        help: errors['company_url'],
                        validateStatus: "error"
                    }}
                    rules={[
                        {
                            required: true,
                            message: <T _str='Company website is required' />,
                        },
                        {
                            type: 'url',
                            message: <T _str='Company website is not a valid url' />,
                        },
                    ]}
                >
                    <Input placeholder="Company website" />
                </Form.Item>

                <Form.Item
                    label={<T _str="Platform name" />}
                    name="platform_name"
                    {...('platform_name' in errors) && {
                        help: errors['platform_name'],
                        validateStatus: "error"
                    }}
                    rules={[
                        {
                            required: true,
                            message: <T _str='Platform name is required' />,
                        },
                    ]}
                >
                    <Input placeholder="Platform name" />
                </Form.Item>

                <Form.Item
                    label={<T _str="Terms of use URL" />}
                    name="term_url"
                    {...('term_url' in errors) && {
                        help: errors['term_url'],
                        validateStatus: "error"
                    }}
                    rules={[
                        {
                            type: 'url',
                            message: <T _str='Term of use url is not a valid url' />,
                        },
                    ]}
                >
                    <Input placeholder="Term of use URL" />
                </Form.Item>

                <Form.Item
                    label={<T _str="Privacy Policy URL" />}
                    name="policy_url"
                    {...('policy_url' in errors) && {
                        help: errors['policy_url'],
                        validateStatus: 'error',
                    }}
                    rules={[
                        {
                            type: 'url',
                            message: <T _str="Privacy Policy url is not a valid url" />,
                        },
                    ]}
                >
                    <Input placeholder="Privacy Policy URL" />
                </Form.Item>
            </div>
            <div className="box last">
                <Paragraph className="form-header">
                    <Title level={4}>
                        <T _str="Branding" />
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
                                    message.success('file uploaded successfully');
                                    return false;
                                }
                                message.error('wrong file');
                                return null;
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <Text strong className="ant-upload-text">
                                <T _str="Drop your logo here" />
                            </Text>
                            <p className="ant-upload-hint">.png .jpg .jpeg ...</p>
                        </Dragger>
                    </Form.Item>
                </Form.Item>
                <div className="colors-container">
                    <Form.Item label={<T _str="Primary color" />}>
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
                    <Form.Item label={<T _str="Secondary color" />}>
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
                    <Form.Item label={<T _str="Accent color" />}>
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
                    <Form.Item label={<T _str="Additional color" />}>
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
