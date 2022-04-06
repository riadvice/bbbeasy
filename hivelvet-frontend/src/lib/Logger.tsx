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

import pino from 'pino';
import { apiRoutes } from '../routing/backend-config';

const levels = {
    http: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
};

const send = async (_level, logEvent) => {
    const url = apiRoutes.LOGS_URL;
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify(logEvent),
    });
};

const Logger = pino({
    customLevels: levels,
    useOnlyCustomLevels: true,
    prettyPrint: {
        colorize: true,
        levelFirst: true,
        translateTime: 'yyyy-dd-mm, h:MM:ss TT',
    },
    browser: {
        serialize: true,
        asObject: true,
        transmit: {
            send,
        },
    },
});

export default Logger;
