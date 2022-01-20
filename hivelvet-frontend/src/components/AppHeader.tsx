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

import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import {Layout, Typography, Radio} from 'antd';

const { Header } = Layout;
const { Paragraph } = Typography;

import enUS from 'antd/lib/locale/en_US';
import frFR from 'antd/lib/locale/fr_FR';
import arEG from 'antd/lib/locale/ar_EG';

type Props = {
    currentLocale : any;
    handleChange : any;
};

type State = {
    locale?: any;
    direction?: any
};

const languages = [
    { name: "English", key: 'en', value : enUS },
    { name: "Français", key: 'fr', value: frFR },
    { name: "العربية", code: 'ar', value: arEG },
];

class AppHeader extends Component<Props, State> {
    render() {
        return (
            <Header className="site-header">
                <Paragraph className="container site-header-inner">
                    <Link to={"/"}>
                        <img className="header-logo-image" src="dist/images/logo.svg" alt="Logo"/>
                    </Link>
                    <Radio.Group value={this.props.currentLocale} onChange={this.props.handleChange}>
                        {languages.map(({ name, key, value }) => (
                            <Radio.Button key={key} value={value}>
                                {name}
                            </Radio.Button>
                        ))}
                    </Radio.Group>
                </Paragraph>
            </Header>
        )
    }
}

export default AppHeader;