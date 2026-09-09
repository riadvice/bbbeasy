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
import { Button, Layout, Typography } from 'antd';
import { Trans, withTranslation } from 'react-i18next';

import { useSettings } from '../../lib/SettingsContext';

const { Footer } = Layout;
const { Text } = Typography;

/**
 * Links the label only when the setting holds a URL. An anchor with an empty href
 * points at the current page and reloads the app when it is clicked.
 */
const ExternalLink = ({ url, children }: { url?: string; children: React.ReactNode }) =>
    url ? (
        <a href={url} target="_blank" rel="noreferrer">
            {children}
        </a>
    ) : (
        <>{children}</>
    );

const AppFooter = () => {
    const { settings } = useSettings();

    return (
        <Footer className="site-footer">
            <Text type="secondary">
                &copy;2022{' '}
                <Button type="link" href={settings?.company_website || undefined}>
                    {settings?.company_name || 'RIADVICE'}
                </Button>{' '}
                <Trans i18nKey="reserved-rights" />
            </Text>
            <Text type="secondary">
                <ExternalLink url={settings?.terms_use}>
                    <Trans i18nKey="term" /> &amp; <Trans i18nKey="conditions" />
                </ExternalLink>{' '}
                |{' '}
                <ExternalLink url={settings?.privacy_policy}>
                    <Trans i18nKey="privacy-policy" />
                </ExternalLink>
            </Text>
        </Footer>
    );
};

export default withTranslation()(AppFooter);
