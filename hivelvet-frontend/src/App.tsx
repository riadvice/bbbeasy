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

import React, { useEffect } from 'react';
import { IRoute } from './routing/IRoute';
import Router from './routing/Router';

import './App.less';
import { Layout, ConfigProvider, BackTop, Button } from 'antd';
import { CaretUpOutlined } from '@ant-design/icons';

import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import AppSider from './components/AppSider';

import 'moment/locale/fr';
import 'moment/locale/ar';
import 'moment/locale/en-au';

import Logger from './lib/logger';

import authService from './services/auth.service';
import LocaleService from './services/locale.service';
import { withTranslation } from 'react-i18next';

const { Content } = Layout;

type userType = {
    username: string;
    email: string;
    role: string;
};

interface IProps {
    routes?: IRoute[];
    isSider?: boolean;
    logs?: string;
}
const App: React.FC<IProps> = ({ routes, isSider, logs }) => {
    const [currentUser, setCurrentUser] = React.useState<userType>(null);
    const [isLogged, setIsLogged] = React.useState<boolean>(false);
    const [language, setLanguage] = React.useState<string>(LocaleService.language);

    const setUser = (user: userType, logged: boolean) => {
        setCurrentUser(user);
        setIsLogged(logged);
    };
    const setLang = (lang: string) => {
        setLanguage(lang);
        LocaleService.changeLocale(lang);
    };
    useEffect(() => {
        Logger.info(logs);
        const user: userType = authService.getCurrentUser();
        if (authService.getCurrentUser() != null) setUser(user, true);
    }, []);

    return (
        <Layout className={LocaleService.direction == 'rtl' ? 'page-layout-content-rtl' : 'page-layout-content'}>
            <ConfigProvider locale={LocaleService.antdlocale} direction={LocaleService.direction} componentSize="large">
                {isLogged && isSider && <AppSider />}
                <Layout className="page-layout-body">
                    <AppHeader
                        currentUser={currentUser}
                        currentLocale={language}
                        setLang={setLang}
                        isLogged={isLogged}
                        setUser={setUser}
                    />
                    <Content className="site-content">
                        <Router routes={routes} setUser={setUser} />
                    </Content>
                    <AppFooter />
                </Layout>
            </ConfigProvider>
            <BackTop>
                <Button type="primary" shape="circle" icon={<CaretUpOutlined />} />
            </BackTop>
        </Layout>
    );
};

export default withTranslation()(App);
