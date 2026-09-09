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

import React from 'react';

type Props = {
    title?: React.ReactNode;
    subTitle?: React.ReactNode;
    extra?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
};

/**
 * Page title bar. Replaces the Ant Design PageHeader, which was dropped from
 * Ant Design 5 and only survived in a package pinned to that major version.
 */
const PageHeader = ({ title, subTitle, extra, className, children }: Props) => (
    <div className={`ant-page-header${className ? ` ${className}` : ''}`}>
        <div className="ant-page-header-heading">
            <div className="ant-page-header-heading-left">
                {title && <span className="ant-page-header-heading-title">{title}</span>}
                {subTitle && <span className="ant-page-header-heading-sub-title">{subTitle}</span>}
            </div>
            {extra && <div className="ant-page-header-heading-extra">{extra}</div>}
        </div>
        {children && <div className="ant-page-header-content">{children}</div>}
    </div>
);

export default PageHeader;
