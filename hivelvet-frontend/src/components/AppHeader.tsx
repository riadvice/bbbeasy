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
import {
    SearchOutlined,
    GlobalOutlined,
    DownOutlined,
    UserOutlined,
    StarOutlined,
    ToolOutlined,
    QuestionCircleOutlined,
    DatabaseOutlined,
    LogoutOutlined,
} from '@ant-design/icons';

import authService from '../services/auth.service';

import enUS from 'antd/lib/locale/en_US';
import frFR from 'antd/lib/locale/fr_FR';
import arEG from 'antd/lib/locale/ar_EG';
import { T } from '@transifex/react';

const { Header } = Layout;
const { Paragraph } = Typography;

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

const languages = [
    { name: 'English', key: 'en', value: enUS },
    { name: 'Français', key: 'fr', value: frFR },
    { name: 'العربية', key: 'ar', value: arEG },
];

class AppHeader extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const user = authService.getCurrentUser();
        this.state = {
            user: user,
        };
    }
    handleChange = (e) => {
        const res = languages.filter((item) => item.key == e.target.value.locale);
        this.props.setLang(res[0].value);
    };
    logout() {
        localStorage.clear();
        this.props.setUser(null, false);
        return <Navigate to="/login" />;
    }

    render() {
        const { currentLocale, isLogged, installed, currentUser } = this.props;
        const result = languages.filter((item) => item.value == currentLocale);
        const language = result[0].key;
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

        const menuProfile = (
            <Menu>
                <Menu.Item key="1" className="username-item text-uppercase">
                    <T _str="Signed in as" /> {currentUser?.username}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="2" icon={<UserOutlined />}>
                    <T _str="Profile" />
                </Menu.Item>
                <Menu.Item key="3" icon={<StarOutlined />}>
                    <T _str="Starred" />
                </Menu.Item>
                <Menu.Item key="4" icon={<ToolOutlined />}>
                    <T _str="Settings" />
                </Menu.Item>
                <Menu.Item key="5" icon={<QuestionCircleOutlined />}>
                    <T _str="Help" />
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="6" icon={<DatabaseOutlined />}>
                    <T _str="Side Administration" />
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="7" icon={<LogoutOutlined />}>
                    <a onClick={() => this.logout()}>
                        <T _str="Sign Out" />
                    </a>
                </Menu.Item>
            </Menu>
        );

        return (
            <Header className="site-header">
                <Paragraph className="site-header-inner">
                    <Link to={'/'}>
                        <img className="header-logo-image" src="images/logo_01.png" alt="Logo" />
                    </Link>

                    {installed && (
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
                            <Space size="large">
                                <Dropdown overlay={menuLang} placement="bottomRight" arrow trigger={['click']}>
                                    <Button size="middle" className="text-uppercase">
                                        <GlobalOutlined /> {language} <DownOutlined />
                                    </Button>
                                </Dropdown>
                                {!isLogged ? (
                                    <>
                                        <Link className={'ant-btn color-primary'} to={'/login'}>
                                            <T _str="Login" />
                                        </Link>
                                        <Link className={'ant-btn color-primary'} to={'/register'}>
                                            <T _str="Sign up" />
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
