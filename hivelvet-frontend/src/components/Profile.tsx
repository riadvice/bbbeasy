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
import { Trans, withTranslation } from 'react-i18next';

import { Avatar, Badge, Button, Col, Form, PageHeader, Row, Space, Tooltip } from 'antd';
import { AddUserForm } from './AddUserForm';
import AuthService from '../services/auth.service';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import LocaleService from '../services/locale.service';

type formType = {
    username?: string;
    email?: string;
    password?: string;
};

const Profile = () => {
    const currentUser = AuthService.getCurrentUser();
    const initialAddValues: formType = {
        username: currentUser.username,
        email: currentUser.email,
        password: '',
    };

    return (
        <>
            <PageHeader className="site-page-header" title={<Trans i18nKey="update_profile" />} />

            <Form
                layout="vertical"
                name="users_form"
                className="site-page-form profile-form"
                initialValues={initialAddValues}
                hideRequiredMark
                validateTrigger="onSubmit"
            >
                <Row>
                    <Col span={9}>
                        <AddUserForm />
                    </Col>

                    <Col span={10} offset={1} className="mt-15">
                        <Space size={30} direction="vertical" align="center">
                            <Badge
                                count={
                                    <Tooltip
                                        placement={LocaleService.direction == 'rtl' ? 'left' : 'right'}
                                        title={<Trans i18nKey="change_avatar" />}
                                    >
                                        <Avatar
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
                                    icon={<UserOutlined />}
                                    size={{ xs: 32, sm: 40, md: 64, lg: 80, xl: 125, xxl: 135 }}
                                    className="hivelvet-btn"
                                />
                            </Badge>

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
