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
import { Link } from 'react-router-dom';
import { Layout, Typography, Radio, Button, Menu, Dropdown, Space } from 'antd';
import { GlobalOutlined, DownOutlined } from '@ant-design/icons';

import enUS from 'antd/lib/locale/en_US';
import frFR from 'antd/lib/locale/fr_FR';
import arEG from 'antd/lib/locale/ar_EG';
import {T} from "@transifex/react";

const { Header } = Layout;
const { Paragraph } = Typography;

type Props = {
    currentLocale: any;
    handleChange: any;
};

type State = {};

const languages = [
    { name: 'English',  key: 'en', value: enUS },
    { name: 'Français', key: 'fr', value: frFR },
    { name: 'العربية',  key: 'ar', value: arEG },
];

class AppHeader extends Component<Props, State> {
    render() {
        const { currentLocale, handleChange } = this.props;

        const result = languages.filter(item => item.value == currentLocale);
        const language = result[0].name;

        const menu = (
            <Menu>
                <Radio.Group value={currentLocale} onChange={handleChange}>
                    {languages.map(({ name, key, value }) => (
                        <Menu.Item key={key}>
                            <Radio value={value}>
                                {name}
                            </Radio>
                        </Menu.Item>
                    ))}
                </Radio.Group>
            </Menu>
        );

        return (
            <Header className="site-header">
                <Paragraph className="site-header-inner">
                    <Link to={'/'}>
                        <img className="header-logo-image" src="images/logo_01.png" alt="Logo"/>
                    </Link>
                    <Space size="large">
                        <Dropdown overlay={menu}>
                            <Button>
                                <GlobalOutlined /> {language} <DownOutlined/>
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
    }
}

export default AppHeader;