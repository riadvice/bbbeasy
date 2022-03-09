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

import React from 'react';
import { Link } from 'react-router-dom';
import { Result } from 'antd';
import { Trans, withTranslation } from 'react-i18next';

const PageNotFound = () => {
    return (
        <Result
            status="404"
            title="404"
            subTitle={<Trans i18nKey="not_found" />}
            className="page-not-found"
            extra={
                <Link className="ant-btn color-blue" to="/">
                    <Trans i18nkey="back-home" />
                </Link>
            }
            //extra={<Link className="ant-btn ant-btn-primary" to="/">Back Home</Link>}
        />
    );
};

export default withTranslation()(PageNotFound);
