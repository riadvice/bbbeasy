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
import { IRoute } from './IRoute';

import PageNotFound from '../components/PageNotFound';
import LandingPage from '../components/LandingPage';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import Reset from '../components/auth/ResetPassword';
import ChangePassword from '../components/auth/ChangePassword';

import Home from '../components/Home';
import Roles from '../components/Roles';
import Users from '../components/Users';
import Labels from '../components/Labels';
import Presets from '../components/Presets';

export const webRoutes: IRoute[] = [
    {
        path: '*',
        element: <PageNotFound />,
    },
    {
        path: '/',
        element: <LandingPage />,
        private: false,
        restricted: true,
    },
    {
        path: '/login',
        element: <Login />,
        private: false,
        restricted: true,
    },
    {
        path: '/register',
        element: <Register />,
        private: false,
        restricted: true,
    },
    {
        path: '/reset-password',
        element: <Reset />,
        private: false,
        restricted: true,
    },
    {
        path: '/change-password',
        element: <ChangePassword />,
        private: false,
        restricted: true,
    },
    {
        path: '/home',
        element: <Home />,
        private: true,
    },
    {
        path: '/settings/roles',
        element: <Roles />,
        private: true,
    },
    {
        path: '/settings/users',
        element: <Users />,
        private: true,
    },
    {
        path: '/presets',
        element: <Presets />,
        private: true,
    },
    {
        path: '/labels',
        element: <Labels />,
        private: true,
    },
];
