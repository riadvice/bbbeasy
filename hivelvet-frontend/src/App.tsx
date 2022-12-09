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

import React, { useEffect, useMemo } from 'react';
import { IRoute } from './routing/IRoute';
import Router from './routing/Router';

import { Layout, ConfigProvider, BackTop, Button } from 'antd';
import { CaretUpOutlined } from '@ant-design/icons';

import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import AppSider from './components/layout/AppSider';

import Logger from './lib/Logger';

import AuthService from './services/auth.service';
import LocaleService from './services/locale.service';
import { withTranslation } from 'react-i18next';
import { UserType } from './types/UserType';
import { UserContext } from './lib/UserContext';
import { hot } from 'react-hot-loader';
const { Content } = Layout;

interface IProps {
    routes?: IRoute[];
    isSider?: boolean;
    logs?: string;
}

const App: React.FC<IProps> = ({ routes, isSider, logs }) => {
    const [currentUser, setCurrentUser] = React.useState<UserType>(null);
    const [isLogged, setIsLogged] = React.useState<boolean>(false);

    const providerValue = useMemo(
        () => ({ isLogged, setIsLogged, currentUser, setCurrentUser }),
        [isLogged, setIsLogged, currentUser, setCurrentUser]
    );

    //loading page and user already logged => set current user
    useEffect(() => {
        Logger.info(logs);
        const user: UserType = AuthService.getCurrentUser();
        if (user != null) {
            setCurrentUser(user);
            setIsLogged(true);
        }
    }, []);

    return (
        <Layout className={LocaleService.direction == 'rtl' ? 'page-layout-content-rtl' : 'page-layout-content'}>
            <ConfigProvider locale={LocaleService.antdlocale} direction={LocaleService.direction} componentSize="large">
                <UserContext.Provider value={providerValue}>
                    {isLogged && isSider && <AppSider />}
                    <Layout className="page-layout-body">
                        <AppHeader />
                        <Content className="site-content">
                            <Router routes={routes} />
                        </Content>
                        <AppFooter />
                    </Layout>
                </UserContext.Provider>
            </ConfigProvider>
            <BackTop>
                <Button type="primary" shape="circle" icon={<CaretUpOutlined />} />
            </BackTop>
        </Layout>
    );
};

export default withTranslation()(hot(module)(App));
