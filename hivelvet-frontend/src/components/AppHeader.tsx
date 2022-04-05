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
import { Link, Navigate } from 'react-router-dom';
import { Layout, Typography, Radio, Button, Menu, Dropdown, Space, Input, Row, Col, RadioChangeEvent } from 'antd';
import { SearchOutlined, GlobalOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';

import { Languages } from './Languages';
import { INSTALLER_FEATURE } from '../constants';
import LocaleService from '../services/locale.service';
import AuthService from "../services/auth.service";

import { LanguageType } from "../types/LanguageType";
import { UserFunctionType } from "../types/UserFunctionType";
import { UserType } from "../types/UserType";
import { LanguageFunctionType } from "../types/LanguageFunctionType";

const { Header } = Layout;
const { Text, Paragraph } = Typography;

type Props = {
    currentLocale: string;
    setLang: LanguageFunctionType;
    isLogged: boolean; //header btns
    currentUser: UserType; //display profil dropdown
    setUser: UserFunctionType; //logout
};

const AppHeader = (props: Props) => {
    const { currentLocale, setLang, isLogged, currentUser, setUser } = props;
    const result: LanguageType[] = Languages.filter((item) => item.value == currentLocale);
    const language: string = result[0].name;

    const logout = () => {
        AuthService.logout()
            .then(() => {
                localStorage.removeItem('user');
                setUser(null, false);
                return <Navigate to="/login" />;
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const handleChange = (e: RadioChangeEvent) => {
        const selectedLang: string = e.target.value;
        setLang(selectedLang);
    };

    const menuLang = (
        <Menu>
            <Radio.Group value={currentLocale} onChange={handleChange}>
                {Languages.map(({ name, key, value }) => (
                    <Menu.Item key={key}>
                        <Radio value={value}>{name}</Radio>
                    </Menu.Item>
                ))}
            </Radio.Group>
        </Menu>
    );
    const dropdownLang = (
        <Dropdown
            overlay={menuLang}
            placement={LocaleService.direction == 'rtl' ? 'bottomLeft' : 'bottomRight'}
            arrow
            trigger={['click']}
        >
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
                <a onClick={() => logout()}>
                    <Trans i18nKey="user_dropdown.logout" />
                </a>
            </Menu.Item>
        </Menu>
    );

    return (
        <Header className="site-header">
            <>
                {!isLogged ? (
                    <Paragraph className="site-header-inner">
                        <Link to={'/'}>
                            <img className="header-logo-image" src="/images/logo_01.png" alt="Logo" />
                        </Link>
                        <Space size="large">
                            {dropdownLang}
                            {!INSTALLER_FEATURE && (
                                <>
                                    <Link className={'ant-btn color-primary'} to={'/login'}>
                                        <Trans i18nKey="login" />
                                    </Link>
                                    <Link className={'ant-btn color-primary'} to={'/register'}>
                                        <Trans i18nKey="sign-up" />
                                    </Link>
                                </>
                            )}
                        </Space>
                    </Paragraph>
                ) : (
                    <Row align="middle">
                        <Col span={14} offset={5} className="text-center">
                            <Input
                                className="search-input"
                                size="middle"
                                placeholder={t('search')}
                                allowClear
                                suffix={<SearchOutlined />}
                                bordered={false}
                            />
                        </Col>
                        <Col span={5} className="text-end">
                            <Space size="middle">
                                {dropdownLang}
                                <Dropdown
                                    overlay={menuProfile}
                                    overlayClassName="profil-btn-dropdown"
                                    placement={LocaleService.direction == 'rtl' ? 'bottomLeft' : 'bottomRight'}
                                    arrow
                                    trigger={['click']}
                                >
                                    <Button type="primary" icon={<UserOutlined />} className="profil-btn" />
                                </Dropdown>
                            </Space>
                        </Col>
                    </Row>
                )}
            </>
        </Header>
    );
};

export default withTranslation()(AppHeader);
