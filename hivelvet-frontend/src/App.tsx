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
import { Layout, ConfigProvider } from 'antd';
import { Route, Routes } from 'react-router-dom';

import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import Login from './components/Login';

import enUS from 'antd/lib/locale/en_US';
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/ar';
import 'moment/locale/en-au';

moment.locale('en');
const { Content } = Layout;

function App() {
    const locale = enUS;
    const [currentLocale, setCurrentLocale] = useState(locale);
    const direction = currentLocale.locale == 'ar' ? 'rtl' : 'ltr';

    const handleChange = (e: any) => {
        const localeValue = e.target.value;
        if (!localeValue) {
            moment.locale('en');
        } else {
            moment.locale(localeValue.locale);
        }
        setCurrentLocale(localeValue);
        localStorage.setItem('locale', localeValue);
    };

    return (
        <Layout>
            <AppHeader currentLocale={currentLocale} handleChange={handleChange} />
            <Content>
                <ConfigProvider locale={currentLocale} direction={direction}>
                    <Routes>
                        <Route path="/" element={<LandingPage key={currentLocale ? currentLocale.locale : 'en'} />} />
                        <Route path="/register" element={<Register key={locale ? currentLocale.locale : 'en'} />} />
                        <Route path="/login" element={<Login key={currentLocale ? currentLocale.locale : 'en'} />} />
                    </Routes>
                </ConfigProvider>
            </Content>
            <AppFooter />
        </Layout>
    );
}

export default App;
