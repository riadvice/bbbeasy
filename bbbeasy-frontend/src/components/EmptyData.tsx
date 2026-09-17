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

import { Empty } from 'antd';
import React from 'react';

type Props = {
    className?: string;
    description: any;
};

/* Ant Design's own drawing is a light grey box made for a light page, and it sat
   on the dark one as a pale smudge. The hexagon is the shape the product already
   uses everywhere, and it takes its colours from the theme. */
const HexagonPlaceholder = () => (
    <svg className="empty-hexagon" viewBox="0 0 120 108" role="presentation" focusable="false">
        <path
            className="empty-hexagon-outline"
            d="M56 9 L94 30.5 L94 73.5 L56 95 L18 73.5 L18 30.5 Z"
        />
        <path
            className="empty-hexagon-mark"
            d="M96 63.7 L110.4 71.7 L110.4 88.3 L96 96.3 L81.6 88.3 L81.6 71.7 Z"
        />
    </svg>
);

const EmptyData = (props: Props) => {
    return (
        <Empty
            image={<HexagonPlaceholder />}
            description={props.description}
            className={props.className ?? 'mt-30'}
        >
            {' '}
        </Empty>
    );
};

export default EmptyData;
