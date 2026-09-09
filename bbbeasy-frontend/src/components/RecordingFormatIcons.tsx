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

import { Space } from 'antd';

import DynamicIcon from './DynamicIcon';

type Props = {
    formats: string[];
    showDisabled?: boolean;
};

const FORMATS: [format: string, icon: string, className?: string][] = [
    ['presentation', 'playback-presentation'],
    ['podcast', 'playback-podcast'],
    ['screenshare', 'DesktopOutlined', 'icon-desktop'],
    ['mp4', 'mp4'],
    ['reports', 'activity-reports'],
];

/**
 * The formats a recording was processed into. The listing shows only what exists,
 * the share dialog also shows what is missing, greyed out.
 */
const RecordingFormatIcons = ({ formats, showDisabled }: Props) => (
    <Space size="middle" className="recording-formats">
        {FORMATS.map(([format, icon, className]) => {
            const enabled = (formats ?? []).includes(format);

            if (!enabled && !showDisabled) {
                return null;
            }

            return (
                <div key={format} className={(enabled ? '' : 'disabled ') + (className ?? '')}>
                    <DynamicIcon type={icon} className={enabled ? undefined : 'icon-disabled'} />
                </div>
            );
        })}
    </Space>
);

export default RecordingFormatIcons;
