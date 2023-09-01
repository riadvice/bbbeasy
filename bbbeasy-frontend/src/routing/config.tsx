/**
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import { IRoute } from './IRoute';

import PageNotFound from '../components/PageNotFound';
import LandingPage from '../components/LandingPage';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import Reset from '../components/auth/ResetPassword';
import ChangePassword from '../components/auth/ChangePassword';

import Rooms from '../components/Rooms';
import Labels from '../components/Labels';
import Presets from '../components/Presets';
import Branding from '../components/Branding';
import Users from '../components/Users';
import Roles from '../components/Roles';
import PresetSettings from '../components/PresetSettings';
import RoomDetails from '../components/RoomDetails';
import Profile from '../components/Profile';
import Recordings from '../components/Recordings';
import Administration from 'components/Administration';

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
        path: '/rooms',
        element: <Rooms />,
        private: true,
    },
    {
        path: '/r/:shortlink',
        element: <RoomDetails />,
        private: false,
    },
    {
        path: '/recordings',
        element: <Recordings />,
        private: true,
    },
    {
        path: '/labels',
        element: <Labels />,
        private: true,
    },
    {
        path: '/presets',
        element: <Presets />,
        private: true,
    },
    {
        path: '/settings/branding',
        element: <Branding />,
        private: true,
    },
    {
        path: '/settings/users',
        element: <Users />,
        private: true,
    },
    {
        path: '/settings/roles',
        element: <Roles />,
        private: true,
    },
    {
        path: '/settings/bigbluebutton',
        element: <PresetSettings />,
        private: true,
    },
    {
        path: '/profile',
        element: <Profile />,
        private: true,
    },
    {
        path: '/settings/administration',
        element: <Administration />,
        private: true,
    },
];
