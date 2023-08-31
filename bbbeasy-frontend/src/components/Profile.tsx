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
import EN_US from '../locale/en-US.json';

import { PageHeader } from '@ant-design/pro-layout';

import { Avatar, Badge, Button, Col, Form, Row, Space, Tooltip, Alert } from 'antd';
import { DeleteOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';

import ImageUploading, { ImageListType } from 'react-images-uploading';
import { PasswordInput } from 'antd-password-input-strength';
import ConfirmPassword from './ConfirmPassword';
import Notifications from './Notifications';
import { AddUserForm } from './AddUserForm';

import AuthService from '../services/auth.service';
import LocaleService from '../services/locale.service';

import axios from 'axios';
import { apiRoutes } from '../routing/backend-config';

import { FormInstance } from 'antd/lib/form';
import { UserType } from '../types/UserType';

type formType = {
    username?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
    confirm_new_password?: string;
    avatar?: string;
};

let accountForm: FormInstance = null;

const Profile = () => {
    const currentUser: UserType = AuthService.getCurrentUser();
    console.log(currentUser.avatar);
    const initialAddValues: formType = {
        username: currentUser.username,
        email: currentUser.email,
        avatar: currentUser.avatar,
    };
    const [images, setImages] = React.useState([]);
    const [errors, setErrors] = React.useState<string>('');

    const handleUpdate = (formValues: formType) => {
        setErrors('');

        // save avatar
        if (images.length != 0 && images[0].file != null) {
            const formData: FormData = new FormData();
            formData.append('logo', images[0].file, images[0].file.name);
            formData.append('logo_name', images[0].file.name);

            axios.post(apiRoutes.SAVE_FILE_URL, formData).catch((error) => {
                console.log(error);
            });

            formValues.avatar = images[0].file.name;
        }

        //edit account
        AuthService.edit_account(formValues)
            .then((response) => {
                const user = response.data.user;
                console.log(user);
                if (user) {
                    //remove passwords from form
                    accountForm.resetFields(['current_password', 'new_password', 'confirm_new_password']);
                    //update LS
                    AuthService.updateCurrentUser(user.username, user.email, user.avatar);
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
            <PageHeader title={<Trans i18nKey="update_profile" />} />
            <Form
                layout="vertical"
                className="site-page-form profile-form"
                ref={(form) => (accountForm = form)}
                initialValues={initialAddValues}
                hideRequiredMark
                scrollToFirstError={true}
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
                                message={<Trans i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errors)} />}
                                showIcon
                            />
                        )}
                        <AddUserForm passwordText="current_password" />
                        <Form.Item
                            label={<Trans i18nKey="new_password" />}
                            name="new_password"
                            rules={[
                                {
                                    min: 8,
                                    message: <Trans i18nKey="password.size" />,
                                },
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
                                                placement={LocaleService.direction == 'rtl' ? 'left' : 'right'}
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
                                                            //   src={  src={logo ? process.env.REACT_APP_API_URL +"/"+ logo : '/images/logo_01.png'}}
                                                            src={
                                                                currentUser.avatar
                                                                    ? process.env.REACT_APP_API_URL +
                                                                      '/' +
                                                                      currentUser.avatar
                                                                    : '/images/logo_01.png'
                                                            }
                                                            width={130}
                                                            height={130}
                                                        />
                                                        <div className="ant-image-mask">
                                                            <div className="ant-image-mask-info">
                                                                <DeleteOutlined onClick={() => onImageRemove(0)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null
                                            }
                                            icon={imageList[0] == null ? <UserOutlined /> : null}
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
