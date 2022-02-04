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

import React, { Component, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import './App.less';
import { Layout, ConfigProvider, BackTop, Button } from 'antd';
import { CaretUpOutlined } from '@ant-design/icons';

import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import Login from './components/Login';
import ResetPwd from './components/ResetPwd';
import Home from './components/Home';

import enUS from 'antd/lib/locale/en_US';
import frFR from 'antd/lib/locale/fr_FR';
import arEG from 'antd/lib/locale/ar_EG';
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/ar';
import 'moment/locale/en-au';
import { tx } from '@transifex/native';
import authService from './services/auth.service';
import Logger from './lib/logger';
import { Props } from 'react-intl/src/components/relative';
import localeValues from 'antd/lib/locale/default';
import PrivateRoute from './components/PrivateRoute';
import Install from './components/Install';

moment.locale('en');

const { Content } = Layout;
tx.init({
    token: '1/7385d403dc3545240d6771327397811a619efe18',
});

tx.setCurrentLocale('en');

Logger.info('Initialisation Hivelvet Frontend Application');

type State = {
    currentUser: any;
    isLogged: boolean;
    language: any;
};
export default class App extends Component<Props, State> {
    direction: any = 'ltr';
    constructor(props: Props) {
        super(props);
        tx.setCurrentLocale('en');

        this.state = {
            currentUser: null,
            isLogged: false,
            language: enUS,
        };
    }

    componentDidMount = () => {
        this.setLang(enUS);

        const user = authService.getCurrentUser();

        if (authService.getCurrentUser() != null) {
            this.setUser(user, true);
        }
    };
    setUser = (user, Logged) => {
        this.setState({
            currentUser: user,
            isLogged: Logged,
        });
    };
    setLang = (lang) => {
        this.setState({
            language: lang,
        });
        this.direction = lang.locale == 'ar' ? 'rtl' : 'ltr';
    };

    render() {
        const { currentUser, isLogged } = this.state;

        return (
            <Layout>
                <ConfigProvider locale={this.state.language} direction={this.direction}>
                    <AppHeader
                        currentLocale={this.state.language}
                        setLang={this.setLang}
                        user={currentUser}
                        isLogged={isLogged}
                        setUser={this.setUser}
                    />
                    <Content className="site-content">
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login setUser={this.setUser} />} />
                            <Route path="/reset" element={<ResetPwd />} />
                            <Route
                                path="/home"
                                element={
                                    <PrivateRoute>
                                        <Home user={this.state.currentUser} isLogged={this.state.isLogged} />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/install"
                                element={
                                    <PrivateRoute>
                                        <Install user={this.state.currentUser} isLogged={this.state.isLogged} />
                                    </PrivateRoute>
                                }
                            />
                        </Routes>
                    </Content>
                    <AppFooter />
                </ConfigProvider>
                <BackTop>
                    <Button type="primary" shape="circle" icon={<CaretUpOutlined />} />
                </BackTop>
            </Layout>
        );
    }
}
