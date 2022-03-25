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
import { Route, Routes } from 'react-router-dom';

import './App.less';
import { Layout, ConfigProvider, BackTop, Button } from 'antd';
import { CaretUpOutlined } from '@ant-design/icons';

import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import Install from './components/Install';
import PageNotFound from './components/PageNotFound';

import 'moment/locale/fr';
import 'moment/locale/ar';
import 'moment/locale/en-au';

import Logger from './lib/logger';

import authService from './services/auth.service';
import { Props } from 'react-intl/src/components/relative';
import LocaleService from './services/locale.service';
import { withTranslation } from 'react-i18next';

const { Content } = Layout;

type userType = {
    username: string;
    email: string;
    role: string;
};
type State = {
    currentUser?: userType;
    isLogged?: boolean;
    language?: string;
};

class InstallApp extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            currentUser: null,
            isLogged: false,
            language: LocaleService.language,
        };
        Logger.info('Initialisation Hivelvet Installer Application');
    }

    componentDidMount = () => {
        const user: userType = authService.getCurrentUser();
        if (authService.getCurrentUser() != null) this.setUser(user, true);
    };

    setUser = (user: userType, Logged: boolean) => {
        this.setState({
            currentUser: user,
            isLogged: Logged,
        });
    };

    setLang = (lang: string) => {
        this.setState({
            language: lang,
        });
        LocaleService.changeLocale(lang);
    };

    render() {
        const { currentUser, isLogged, language } = this.state;

        return (
            <Layout className={LocaleService.direction == 'rtl' ? 'page-layout-content-rtl' : 'page-layout-content'}>
                <ConfigProvider
                    locale={LocaleService.antdlocale}
                    direction={LocaleService.direction}
                    componentSize="large"
                >
                    <AppHeader
                        currentUser={currentUser}
                        currentLocale={language}
                        setLang={this.setLang}
                        isLogged={isLogged}
                        setUser={this.setUser}
                    />

                    <Layout>
                        <Content className="site-content">
                            <Routes>
                                <Route path="/" element={<Install />} />
                                <Route path="*" element={<PageNotFound />} />
                            </Routes>
                        </Content>
                    </Layout>
                    <AppFooter />
                </ConfigProvider>
                <BackTop>
                    <Button type="primary" shape="circle" icon={<CaretUpOutlined />} />
                </BackTop>
            </Layout>
        );
    }
}

export default withTranslation()(InstallApp);
