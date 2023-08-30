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
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';

interface IProps {
    routes: IRoute[];
}

const Router: React.FC<IProps> = ({ routes }) => {
    const checkAccess = (route: IRoute) => {
        if (route.private) return <PrivateRoute>{route.element}</PrivateRoute>;
        else return <PublicRoute restricted={route.restricted}>{route.element}</PublicRoute>;
    };

    const RenderComponent = (props): JSX.Element => {
        const route = props.route;
        if (route.path == '*') return route.element;
        else {
            return checkAccess(route);
        }
    };

    return (
        <Routes>
            {routes &&
                routes.map((route: IRoute, index) => (
                    <Route key={index} path={route.path} element={<RenderComponent route={route} />} />
                ))}
        </Routes>
    );
};

export default Router;
