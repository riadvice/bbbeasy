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
import { Layout, Typography, Radio, Button, Menu, Dropdown, Space } from 'antd';
import { GlobalOutlined, DownOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

import { Trans } from 'react-i18next';
import Languages from './Languages';
const { Header } = Layout;
const { Paragraph } = Typography;

type Props = {
    currentLocale: any;
    setLang: any;
    isLogged: boolean;
    setUser: any;
    installed: any;
};

type State = {};

class AppHeader extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLogin: false,
            isLogout: false,
            user: {},
        };
    }
    logout() {
        localStorage.clear();
        this.props.setUser(null, false);
        return <Navigate to="/login" />;
    }

    handleChange = (e) => {
        const res = Languages.filter((item) => item.value == e.target.value);
        this.props.setLang(res[0].value);
    };

    render() {
        const { currentLocale, isLogged, installed } = this.props;
        const result = Languages.filter((item) => item.value == currentLocale);
        const language = result[0].key;
        const menu = (
            <Menu>
                <Radio.Group value={currentLocale} onChange={this.handleChange}>
                    {Languages.map(({ name, key, value }) => (
                        <Menu.Item key={key}>
                            <Radio value={value}>{name}</Radio>
                        </Menu.Item>
                    ))}
                </Radio.Group>
            </Menu>
        );

        return (
            <Header className="site-header">
                <Paragraph className="site-header-inner">
                    <Link to={'/'}>
                        <img className="header-logo-image" src="images/logo_01.png" alt="Logo" />
                    </Link>
                    {installed && (
                        <Space size="large">
                            <Dropdown overlay={menu} arrow trigger={['click']}>
                                <Button size="middle" className="text-uppercase">
                                    <GlobalOutlined /> {language} <DownOutlined />
                                </Button>
                            </Dropdown>
                            {!isLogged ? (
                                <>
                                    <Link className={'ant-btn color-primary'} to={'/login'}>
                                        {' '}
                                        <Trans i18nKey="login" />
                                    </Link>
                                    <Link className={'ant-btn color-primary'} to={'/register'}>
                                        {' '}
                                        <Trans i18nKey="sign-up" />{' '}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Button type="primary" icon={<UserOutlined />} className="profil-btn" />
                                    <Button
                                      
                                        type="primary"
                                        icon={<LogoutOutlined  rotate={this.props.currentLocale.includes("ar")?180:0 }  />}
                                        className="logout-btn"
                                        onClick={() => this.logout()}
                                    />
                                </>
                            )}
                        </Space>
                    )}
                </Paragraph>
            </Header>
        );
    }
}

export default AppHeader;
