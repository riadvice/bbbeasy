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
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import Login from './components/Login';
import ResetPwd from './components/ResetPwd';
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
    token: '1/a6cfd7935802d07ec8332208a02c8ce02fbfc01c',
});

tx.setCurrentLocale('en');

Logger.info('Initialisation Hivelvet Frontend Application');

function App() {
    const locale = enUS;
    const [currentLocale, setCurrentLocale] = useState(locale);
    const direction = currentLocale.locale !== 'ar' ? 'ltr' : 'rtl';
    localStorage.setItem('locale', tx.getCurrentLocale());
    const handleChange = (e) => {
        const localeValue = e.target.value;
        if (!localeValue) {
            moment.locale('en');
        } else {
            moment.locale(localeValue.locale);
        }
        tx.setCurrentLocale(localeValue.locale);
        setCurrentLocale(localeValue);
    };

    return (
        <Layout>
            <ConfigProvider locale={currentLocale} direction={direction}>
                <AppHeader currentLocale={currentLocale} handleChange={handleChange} />
                <Content className="site-content">
                    <Routes>
                        <Route path="/" element={<LandingPage key={currentLocale ? currentLocale.locale : 'en' }/>} />
                        <Route path="/register" element={<Register key={locale ? currentLocale.locale : 'en' }/>} />
                        <Route path="/login" element={<Login key={currentLocale ? currentLocale.locale : 'en' }/>} />
                        <Route path="/reset" element={<ResetPwd key={currentLocale ? currentLocale.locale : 'en' }/>} />
                        <Route path="/home" element={<Home key={currentLocale ? currentLocale.locale : 'en' }/>} />
                    </Routes>
                </Content>
                <AppFooter key={currentLocale ? currentLocale.locale : 'en'} />
            </ConfigProvider>
            <BackTop>
                <Button type="primary" shape="circle" icon={<CaretUpOutlined />} />
            </BackTop>
        </Layout>
    );
}

export default App;
