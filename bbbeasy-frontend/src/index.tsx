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
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import App from './App';

import { INSTALLER_FEATURE } from './constants';
import { webRoutes } from './routing/config';
import { installRoutes } from './routing/config-install';

import './App-webapp.css';
import './App-installer.css';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root container not found');
}
const root = createRoot(container);

if (!INSTALLER_FEATURE) {
    root.render(
        <BrowserRouter>
            <App routes={webRoutes} isSider={true} logs={'Initialisation BBBEasy Webapp Application'} />
        </BrowserRouter>
    );
}

if (INSTALLER_FEATURE) {
    root.render(
        <BrowserRouter>
            <App routes={installRoutes} isSider={false} logs={'Initialisation BBBEasy Installer Application'} />
        </BrowserRouter>
    );
}

reportWebVitals(console.log);
