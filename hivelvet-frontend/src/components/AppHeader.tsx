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

import React, { Component, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Layout, Typography, Radio, Button, Menu, Dropdown, Space } from 'antd';
import { GlobalOutlined, DownOutlined } from '@ant-design/icons';

import enUS from 'antd/lib/locale/en_US';
import frFR from 'antd/lib/locale/fr_FR';
import arEG from 'antd/lib/locale/ar_EG';
import { T } from '@transifex/react';
import authService from '../services/auth.service';
import { umask } from 'process';
import { tx } from '@transifex/native';
import moment from 'moment';

const { Header } = Layout;
const { Paragraph } = Typography;

type Props = {
    currentLocale: any;
    user: any;
    isLogged: boolean;
    setUser: any;
    setLang: any;
};

type State = {
    isLogin: boolean;
    isLogout: boolean;
    user: any;
};

const languages = [
    { name: 'English', key: 'en', value: enUS },
    { name: 'Français', key: 'fr', value: frFR },
    { name: 'العربية', key: 'ar', value: arEG },
];

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
    }

    handleChange = (e) => {
        const res = languages.filter((item) => item.key == e.target.value.locale);

        this.props.setLang(res[0].value);
    };
    render() {
        const { currentLocale, user, isLogged } = this.props;
        const result = languages.filter((item) => item.value == currentLocale);

        const language = result[0].name;

        const menu = (
            <Menu>
                <Radio.Group value={this.props.currentLocale} onChange={this.handleChange}>
                    {languages.map(({ name, key, value }) => (
                        <Menu.Item key={key}>
                            <Radio value={value}>{name}</Radio>
                        </Menu.Item>
                    ))}
                </Radio.Group>
            </Menu>
        );
        if (!isLogged) {
            return (
                <Header className="site-header">
                    <Paragraph className="site-header-inner">
                        <Link to={'/'}>
                            <img className="header-logo-image" src="images/logo_01.png" alt="Logo" />
                        </Link>

                        <Space size="large">
                            <Dropdown overlay={menu}>
                                <Button>
                                    <GlobalOutlined /> {language} <DownOutlined />
                                </Button>
                            </Dropdown>
                            <Link className={'ant-btn color-primary'} to={'/login'}>
                                {' '}
                                <T _str="Login" />{' '}
                            </Link>
                            <Link className={'ant-btn color-primary'} to={'/register'}>
                                {' '}
                                <T _str="Sign up" />{' '}
                            </Link>
                        </Space>
                    </Paragraph>
                </Header>
            );
        } else {
            return (
                <Header className="site-header">
                    <Paragraph className="site-header-inner">
                        <Link to={'/'}>
                            <img className="header-logo-image" src="images/logo_01.png" alt="Logo" />
                        </Link>

                        <Space size="large">
                            <Dropdown overlay={menu}>
                                <Button>
                                    <GlobalOutlined /> {language} <DownOutlined />
                                </Button>
                            </Dropdown>

                            <Link className={'ant-btn color-primary'} to={'/login'} onClick={() => this.logout()}>
                                {' '}
                                <T _str="Logout" />{' '}
                            </Link>
                        </Space>
                    </Paragraph>
                </Header>
            );
        }
    }
}

export default AppHeader;
