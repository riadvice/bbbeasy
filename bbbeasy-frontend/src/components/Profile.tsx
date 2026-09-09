/**
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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
import EN_US from '../locale/en-US.json';

import PageHeader from './PageHeader';

import { Avatar, Badge, Button, Col, Form, Row, Space, Tooltip, Alert } from 'antd';
import { DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';

import ImageUploadingImport from 'react-images-uploading';
import type { ImageListType } from 'react-images-uploading';
import { PasswordInput } from 'antd-password-input-strength';
import ConfirmPassword from './ConfirmPassword';
import Notifications from './Notifications';
import { AddUserForm } from './AddUserForm';

import AuthService from '../services/auth.service';
import LocaleService from '../services/locale.service';
import { UserContext } from '../lib/UserContext';

import { UserType } from '../types/UserType';

// The package is CommonJS and ships no ESM entry, so the bundler hands the default
// import back as the module object rather than as the component inside it.
const ImageUploading =
    (ImageUploadingImport as { default?: typeof ImageUploadingImport }).default ?? ImageUploadingImport;

type formType = {
    username?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
    confirm_new_password?: string;
    avatar?: string;
};

const Profile = () => {
    const [accountForm] = Form.useForm();
    const { setCurrentUser } = React.useContext(UserContext);
    const [currentUser, setCurrentLocalUser] = React.useState<UserType>(() => AuthService.getCurrentUser());
    const initialAddValues: formType = {
        username: currentUser.username,
        email: currentUser.email,
        avatar: currentUser.avatar,
    };
    const [images, setImages] = React.useState([]);
    const [errors, setErrors] = React.useState<string>('');

    const handleUpdate = async (formValues: formType) => {
        setErrors('');

        // save avatar as base64
        if (images.length !== 0 && images[0].file != null) {
            try {
                // Resize image and convert to base64
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const img = new window.Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_SIZE = 200;
                            let width = img.width;
                            let height = img.height;
                            if (width > height) {
                                if (width > MAX_SIZE) {
                                    height = (height * MAX_SIZE) / width;
                                    width = MAX_SIZE;
                                }
                            } else {
                                if (height > MAX_SIZE) {
                                    width = (width * MAX_SIZE) / height;
                                    height = MAX_SIZE;
                                }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            resolve(canvas.toDataURL('image/png'));
                        };
                        img.onerror = reject;
                        img.src = reader.result as string;
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(images[0].file);
                });
                formValues.avatar = base64;
            } catch (error) {
                console.log(error);
                Notifications.openNotificationWithIcon('error', t('file_upload_error'));
                return;
            }
        }

        //edit account
        AuthService.edit_account(formValues)
            .then((response) => {
                const user = response.data.user;
                if (user) {
                    //remove passwords from form
                    accountForm.resetFields(['current_password', 'new_password', 'confirm_new_password']);
                    //update LS

                    AuthService.updateCurrentUser(user.username, user.email, user.avatar);
                    const updatedUser = {
                        ...currentUser,
                        username: user.username,
                        email: user.email,
                        avatar: user.avatar,
                    } as UserType;

                    setCurrentUser(updatedUser);
                    setCurrentLocalUser(updatedUser);
                    setImages([]);
                    Notifications.openNotificationWithIcon('success', t('edit_account_success'));
                }
            })
            .catch((error) => {
                console.log(error.response.data.message);
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                }
                if (error.response.data.message) {
                    setErrors(error.response.data.message);
                }
            });
    };

    return (
        <>
            <PageHeader className="site-page-header profile-page-header" title={<Trans i18nKey="update_profile" />} />
            <Form
                form={accountForm}
                layout="vertical"
                className="site-page-form profile-form"
                initialValues={initialAddValues}
                requiredMark={false}
                scrollToFirstError
                validateTrigger="onSubmit"
                onFinish={handleUpdate}
                onValuesChange={() => setErrors('')}
            >
                <Row>
                    <Col span={9}>
                        {errors && (
                            <Alert
                                type="error"
                                className="alert-msg"
                                message={
                                    <Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] === errors)} />
                                }
                                showIcon
                            />
                        )}
                        <AddUserForm passwordText="current_password" />
                        <Form.Item
                            label={<Trans i18nKey="new_password" />}
                            name="new_password"
                            dependencies={['current_password']}
                            rules={[
                                {
                                    min: 8,
                                    message: <Trans i18nKey="password.size" />,
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('current_password') !== value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(t('password-not-changed')));
                                    },
                                }),
                            ]}
                        >
                            <PasswordInput placeholder="**********" />
                        </Form.Item>
                        <ConfirmPassword dependOn="new_password" confirmText="confirm_new_password" />
                    </Col>

                    <Col span={10} offset={1} className="mt-15">
                        <Space size={30} direction="vertical" align="center">
                            <ImageUploading
                                multiple={false}
                                value={images}
                                onChange={(imageList: ImageListType) => setImages(imageList as never[])}
                                maxNumber={1}
                            >
                                {({ imageList, onImageUpload, onImageUpdate, onImageRemove }) => (
                                    <Badge
                                        count={
                                            <Tooltip
                                                placement={LocaleService.direction === 'rtl' ? 'left' : 'right'}
                                                title={<Trans i18nKey="change_avatar" />}
                                            >
                                                <Avatar
                                                    onClick={
                                                        imageList[0] == null ? onImageUpload : () => onImageUpdate(0)
                                                    }
                                                    size={40}
                                                    icon={
                                                        <div className="custom-badge">
                                                            <EditOutlined />
                                                        </div>
                                                    }
                                                    className="custom-badge-bg"
                                                />
                                            </Tooltip>
                                        }
                                    >
                                        <Avatar
                                            src={
                                                imageList[0] != null ? (
                                                    <div className="ant-image">
                                                        <img
                                                            className="ant-image-img"
                                                            src={imageList[0]?.dataURL || currentUser.avatar}
                                                            width={130}
                                                            height={130}
                                                        />
                                                        <div className="ant-image-mask">
                                                            <div className="ant-image-mask-info">
                                                                <DeleteOutlined onClick={() => onImageRemove(0)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : currentUser.avatar ? (
                                                    <img
                                                        className="ant-image-img"
                                                        src={currentUser.avatar}
                                                        width={130}
                                                        height={130}
                                                        style={{ borderRadius: '50%' }}
                                                    />
                                                ) : null
                                            }
                                            icon={imageList[0] == null && !currentUser.avatar ? <UserOutlined /> : null}
                                            size={{ xs: 32, sm: 40, md: 64, lg: 80, xl: 125, xxl: 135 }}
                                            className="bbbeasy-btn"
                                        />
                                    </Badge>
                                )}
                            </ImageUploading>
                            <Form.Item>
                                <Button type="primary" id="submit-btn" htmlType="submit" block className="p-50">
                                    <Trans i18nKey={'update_profile'} />
                                </Button>
                            </Form.Item>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </>
    );
};

export default withTranslation()(Profile);
