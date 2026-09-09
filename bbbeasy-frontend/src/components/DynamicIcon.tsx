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
import Icon from '@ant-design/icons';
import * as AntdIcons from '@ant-design/icons';
import { withTranslation } from 'react-i18next';

import { BBBEASY_ICON_PATHS, BBBEASY_ICON_TRANSFORM, BBBEASY_ICON_VIEWBOX } from './BBBEasyIcons';

type Props = {
    type: string;
    className?: string;
};

const BBBEasyIcon = ({ path }: { path: string }) => (
    <svg viewBox={BBBEASY_ICON_VIEWBOX} width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <g transform={BBBEASY_ICON_TRANSFORM}>
            <path d={path} />
        </g>
    </svg>
);

const DynamicIcon = ({ type, className }: Props) => {
    const path = BBBEASY_ICON_PATHS[type.toLowerCase()];

    if (path) {
        return <Icon component={() => <BBBEasyIcon path={path} />} className={className} />;
    }

    const AntdIcon = AntdIcons[type];

    return <AntdIcon className={className} />;
};

export default withTranslation()(DynamicIcon);
