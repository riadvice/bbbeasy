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

import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import './App.less';
import { Layout, ConfigProvider, BackTop, Button } from 'antd';
import { CaretUpOutlined } from '@ant-design/icons';

import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';

import Install from './components/Install';
import PageNotFound from './components/PageNotFound';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import Login from './components/Login';
import Reset from './components/ResetPassword';
import ChangePassword from './components/ChangePassword';
import Home from './components/Home';

import enUS from 'antd/lib/locale/en_US';
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/ar';
import 'moment/locale/en-au';
import { tx } from '@transifex/native';

import Logger from './lib/logger';

moment.locale('en');

const { Content } = Layout;
tx.init({
    token: '1/7385d403dc3545240d6771327397811a619efe18',
});

tx.setCurrentLocale('en');

Logger.info('Initialisation Hivelvet Frontend Application');

function App() {
    const locale = enUS;
    const [currentLocale, setCurrentLocale] = useState(locale);
    const direction = currentLocale.locale !== 'ar' ? 'ltr' : 'rtl';
    const handleChange = (e) => {
        const localeValue = e.target.value;
        if (!localeValue) {
            moment.locale('en');
        } else {
            moment.locale(localeValue.locale);
        }
        tx.setCurrentLocale(localeValue.locale);
        setCurrentLocale(localeValue);
        //localStorage.setItem('locale', tx.getCurrentLocale());
        localStorage.setItem('locale', localeValue.locale);
    };

    // to be changed by backend after installation
    const isInstalled: boolean = JSON.parse(process.env.REACT_APP_INSTALLED) || false;
    const [installed, setInstalled] = useState(isInstalled);
    const handleInstall = () => {
        // @todo for future tasks change env var REACT_APP_INSTALLED to true
        setInstalled(true);
    };

    return (
        <Layout>
            <ConfigProvider locale={currentLocale} direction={direction} componentSize="large">
                <AppHeader currentLocale={currentLocale} handleChange={handleChange} installed={installed} />
                <Content className="site-content">
                    {installed ? (
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/reset-password" element={<Reset />} />
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="*" element={<PageNotFound />} />
                        </Routes>
                    ) : (
                        <Routes>
                            <Route path="/" element={<Install installed={installed} handleInstall={handleInstall} />} />
                            <Route path="*" element={<PageNotFound />} />
                        </Routes>
                    )}
                </Content>
                <AppFooter />
            </ConfigProvider>
            <BackTop>
                <Button type="primary" shape="circle" icon={<CaretUpOutlined />} />
            </BackTop>
        </Layout>
    );
}

export default App;
