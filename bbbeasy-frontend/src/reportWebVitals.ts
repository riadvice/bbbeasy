/**
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

import type { Metric } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
    if (typeof onPerfEntry === 'function') {
        import('web-vitals')
            .then((webVitals) => {
                webVitals.onCLS(onPerfEntry);
                webVitals.onINP(onPerfEntry);
                webVitals.onFCP(onPerfEntry);
                webVitals.onLCP(onPerfEntry);
                webVitals.onTTFB(onPerfEntry);
            })
            .catch((error) => {
                console.error('Error loading web-vitals:', error);
            });
    }
};

export default reportWebVitals;
