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
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';

import Login from '../components/Login';

type userType = {
    username: string;
    email: string;
    role: string;
};
type userFunction = (user: userType, Logged: boolean) => void;

interface IProps {
    routes: IRoute[];
    setUser: userFunction;
}

const Router: React.FC<IProps> = ({ routes, setUser }) => {
    return (
        <Routes>
            {routes &&
                routes.map((route: IRoute, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        element={
                            route.path == '*' ? (
                                route.element
                            ) : route.private ? (
                                <PrivateRoute>{route.element}</PrivateRoute>
                            ) : (
                                <PublicRoute restricted={route.restricted}>
                                    {route.path == '/login' ? <Login setUser={setUser} /> : route.element}
                                </PublicRoute>
                            )
                        }
                    />
                ))}
        </Routes>
    );
};

export default Router;
