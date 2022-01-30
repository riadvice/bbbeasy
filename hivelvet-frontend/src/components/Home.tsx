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

import React, { Component } from 'react';
import AuthService from '../services/auth.service';

import { Row } from 'antd';
import { Navigate } from 'react-router-dom';

type Props = {};

type State = {
    isLogged: boolean;
    currentUser?: any;
};

class Home extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLogged: false,
            currentUser: undefined,
        };
    }

    componentDidMount() {
        const user = AuthService.getCurrentUser();
        if (user) {
            this.setState({
                isLogged: true,
                currentUser: user,
            });
        }
    }

    render() {
        const { isLogged } = this.state;

        /*
        if (!isLogged) {
            return <Navigate to="/login" />;
        }
        */

        return (
            <Row justify="center">
                <h1>Home page</h1>
            </Row>
        );
    }
}

export default Home;
