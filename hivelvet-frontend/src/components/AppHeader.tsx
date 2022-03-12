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

import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Layout, Typography, Radio, Button, Menu, Dropdown, Space, Input } from 'antd';
import { SearchOutlined, GlobalOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

import authService from '../services/auth.service';
import { Trans } from 'react-i18next';
import languages from './Languages';

const { Header } = Layout;
const { Text, Paragraph } = Typography;

type userType = {
    username: string;
    email: string;
    role: string;
};
type Props = {
    currentLocale: any;
    setLang: any;
    isLogged: boolean;
    setUser: any;
    installed: any;
    currentUser: any;
};
type State = {
    user: userType;
};

class AppHeader extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const user = authService.getCurrentUser();
        this.state = {
            user: user,
        };
    }
    logout() {
        localStorage.clear();
        this.props.setUser(null, false);
        return <Navigate to="/login" />;
    }

    handleChange = (e) => {
        const selectedLang = e.target.value;
        this.props.setLang(selectedLang);
    };

    render() {
        const { currentLocale, isLogged, installed, currentUser } = this.props;
        const result = languages.filter((item) => item.value == currentLocale);
        const language = result[0].name;

        const menuLang = (
            <Menu>
                <Radio.Group value={currentLocale} onChange={this.handleChange}>
                    {languages.map(({ name, key, value }) => (
                        <Menu.Item key={key}>
                            <Radio value={value}>{name}</Radio>
                        </Menu.Item>
                    ))}
                </Radio.Group>
            </Menu>
        );

        const dropdownLang = (
            <Dropdown overlay={menuLang} placement="bottomCenter" arrow trigger={['click']}>
                <Button type="link" size="middle" className="lang-btn">
                    <GlobalOutlined /> {language}
                </Button>
            </Dropdown>
        );

        const menuProfile = (
            <Menu>
                <Menu.Item key="1" className="username-item">
                    <Trans i18nKey="signed_as" /> {currentUser?.username}
                    <br />
                    <Text>{currentUser?.email}</Text>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="2" icon={<UserOutlined />}>
                    <Trans i18nKey="user_dropdown.profile" />
                </Menu.Item>
                <Menu.Item key="3" icon={<LogoutOutlined />}>
                    <a onClick={() => this.logout()}>
                        <Trans i18nKey="user_dropdown.logout" />
                    </a>
                </Menu.Item>
            </Menu>
        );

        return (
            <Header className="site-header">
                <Paragraph className="site-header-inner">
                    <Link to={'/'}>
                        <img className="header-logo-image" src="/images/logo_01.png" alt="Logo" />
                    </Link>
                    {!installed ? (
                        dropdownLang
                    ) : (
                        <>
                            {isLogged && (
                                <Input
                                    className="search-input"
                                    size="middle"
                                    placeholder="Search"
                                    allowClear
                                    suffix={<SearchOutlined />}
                                    bordered={false}
                                />
                            )}
                            <Space size={isLogged ? 'middle' : 'large'}>
                                {dropdownLang}
                                {!isLogged ? (
                                    <>
                                        <Link className={'ant-btn color-primary'} to={'/login'}>
                                            <Trans i18nKey="login" />
                                        </Link>
                                        <Link className={'ant-btn color-primary'} to={'/register'}>
                                            <Trans i18nKey="sign-up" />
                                        </Link>
                                    </>
                                ) : (
                                    <Dropdown
                                        overlay={menuProfile}
                                        overlayClassName="profil-btn-dropdown"
                                        placement="bottomRight"
                                        arrow
                                        trigger={['click']}
                                    >
                                        <Button type="primary" icon={<UserOutlined />} className="profil-btn" />
                                    </Dropdown>
                                )}
                            </Space>
                        </>
                    )}
                </Paragraph>
            </Header>
        );
    }
}

export default AppHeader;
