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

import React, { useEffect, useMemo, useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import { IRoute } from './routing/IRoute';
import Router from './routing/Router';

import { Layout, ConfigProvider, FloatButton } from 'antd';
import { StyleProvider, legacyLogicalPropertiesTransformer } from '@ant-design/cssinjs';

import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import AppSider from './components/layout/AppSider';

import Logger from './lib/Logger';
import AuthService from './services/auth.service';
import LocaleService from './services/locale.service';
import RoomsService from 'services/rooms.service';
import LabelsService from 'services/labels.service';
import PresetsService from 'services/presets.service';
import SettingsService from 'services/settings.service';

import { UserContext } from './lib/UserContext';
import { DataContext } from 'lib/RoomsContext';

import { RoomType } from 'types/RoomType';
import { LabelType } from 'types/LabelType';
import { PresetType } from 'types/PresetType';
import { UserType } from './types/UserType';
import { SessionType } from './types/SessionType';

const { Content } = Layout;

interface IProps {
    routes?: IRoute[];
    isSider?: boolean;
    logs?: string;
}

const App: React.FC<IProps> = ({ routes, isSider, logs }) => {
    const [currentUser, setCurrentUser] = React.useState<UserType | null>(() => AuthService.getCurrentUser());
    const [currentSession, setCurrentSession] = React.useState<SessionType | null>(() => AuthService.getCurrentSession());
    const [isLogged, setIsLogged] = React.useState<boolean>(() => Boolean(AuthService.getCurrentUser() && AuthService.getCurrentSession()));
    const isAuthenticated = Boolean(AuthService.getCurrentUser() && AuthService.getCurrentSession());

    const [dataRooms, setDataRooms] = React.useState<RoomType[]>([]);
    const [dataLabels, setDataLabels] = React.useState<LabelType[]>([]);
    const [dataPresets, setDataPresets] = React.useState<PresetType[]>([]);
    const [brandColor, setBrandColor] = React.useState<string>('#fbbc0b');
    const [defaultFontSize, setDefaultFontSize] = React.useState<number>(14);
    const [borderRadius, setBorderRadius] = React.useState<number>(6);
    const [wireframeStyle, setWireframeStyle] = React.useState<boolean>(false);

    const dataProvider = useMemo(
        () => ({ dataRooms, setDataRooms, dataLabels, setDataLabels, dataPresets, setDataPresets }),
        [dataRooms, dataLabels, dataPresets]
    );

    const userProvider = useMemo(
        () => ({ isLogged, setIsLogged, currentUser, setCurrentUser, currentSession, setCurrentSession }),
        [isLogged, currentUser, currentSession]
    );
    const authViewKey = isLogged ? 'authenticated' : 'anonymous';

    const customTheme = useMemo(() => ({
        token: {
            colorPrimary: brandColor,
            colorPrimaryHover: brandColor + 'cc',
            colorPrimaryActive: brandColor + '99',
            outlineColor: brandColor + '1a',

            colorBorder: '#dddfe1',

            colorLink: brandColor,
            colorLinkHover: brandColor + 'cc',
            colorLinkActive: brandColor + 'cc',

            borderRadiusLG: borderRadius,
            fontSize: defaultFontSize,
            wireframe: wireframeStyle,
        },
        components: {
            Button: {
                colorPrimary: brandColor,
                colorPrimaryHover: brandColor + 'cc',
                colorPrimaryActive: brandColor + '99',
                primaryShadow: brandColor + '33',
            },
        },
    }), [brandColor, borderRadius, defaultFontSize, wireframeStyle]);

    const getRooms = useCallback((userId: number) => {
        RoomsService.list_rooms(userId)
            .then((response) => {
                setDataRooms(response.data);
            })
            .catch((error) => {
                console.error('Error fetching rooms:', error);
            });
    }, []);

    const getLabels = useCallback(() => {
        LabelsService.list_labels()
            .then((response) => {
                setDataLabels(response.data);
            })
            .catch((error) => {
                console.error('Error fetching labels:', error);
            });
    }, []);

    const getPresets = useCallback((userId: number) => {
        PresetsService.list_presets(userId)
            .then((response) => {
                setDataPresets(response.data);
            })
            .catch((error) => {
                console.error('Error fetching presets:', error);
            });
    }, []);

    useEffect(() => {
        SettingsService.collect_settings()
            .then((response) => {
                const settings = response.data;
                if (settings) {
                    if (settings.brand_color) {
                        setBrandColor(settings.brand_color);
                        document.documentElement.style.setProperty('--bbbeasy-brand-color', settings.brand_color);
                        document.documentElement.style.setProperty('--bbbeasy-brand-color-hover', settings.brand_color + 'cc');
                        // Convert hex to rgba for shadow
                        const hex = settings.brand_color.replace('#', '');
                        const r = parseInt(hex.substring(0, 2), 16);
                        const g = parseInt(hex.substring(2, 4), 16);
                        const b = parseInt(hex.substring(4, 6), 16);
                        document.documentElement.style.setProperty('--bbbeasy-brand-color-shadow', `rgba(${r}, ${g}, ${b}, 0.35)`);

                        // Inject dynamic styles AFTER Ant Design CSS-in-JS (always wins)
                        let styleEl = document.getElementById('brand-dynamic-styles');
                        if (!styleEl) {
                            styleEl = document.createElement('style');
                            styleEl.id = 'brand-dynamic-styles';
                            document.head.appendChild(styleEl);
                        }
                        styleEl.textContent = `
                            /* Primary solid buttons only */
                            .ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid {
                                background-color: ${settings.brand_color} !important;
                                border-color: ${settings.brand_color} !important;
                                color: #ffffff !important;
                                box-shadow: 0 2px 0 ${settings.brand_color}33 !important;
                            }
                            .ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid:hover,
                            .ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid:focus {
                                background-color: ${settings.brand_color}cc !important;
                                border-color: ${settings.brand_color}cc !important;
                            }
                            .ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid:active {
                                background-color: ${settings.brand_color}99 !important;
                                border-color: ${settings.brand_color}99 !important;
                            }
                            /* Ghost primary buttons - transparent bg, white icons */
                            .ant-btn-background-ghost.ant-btn-primary {
                                background: transparent !important;
                                border-color: ${settings.brand_color} !important;
                                color: #ffffff !important;
                            }
                            .ant-btn-background-ghost.ant-btn-primary .anticon,
                            .ant-btn-background-ghost.ant-btn-primary .icon-bbbeasy-mp4,
                            .ant-btn-background-ghost.ant-btn-primary .icon-bbbeasy-playback-podcast,
                            .ant-btn-background-ghost.ant-btn-primary .icon-bbbeasy-playback-presentation,
                            .ant-btn-background-ghost.ant-btn-primary .icon-bbbeasy-activity-reports {
                                color: #ffffff !important;
                            }
                            .ant-btn-background-ghost.ant-btn-primary:hover,
                            .ant-btn-background-ghost.ant-btn-primary:focus {
                                color: #ffffff !important;
                                border-color: ${settings.brand_color}cc !important;
                                background: ${settings.brand_color}1a !important;
                            }
                            .ant-btn-background-ghost.ant-btn-primary:hover .anticon,
                            .ant-btn-background-ghost.ant-btn-primary:focus .anticon,
                            .ant-btn-background-ghost.ant-btn-primary:hover .icon-bbbeasy-mp4,
                            .ant-btn-background-ghost.ant-btn-primary:focus .icon-bbbeasy-mp4,
                            .ant-btn-background-ghost.ant-btn-primary:hover .icon-bbbeasy-playback-podcast,
                            .ant-btn-background-ghost.ant-btn-primary:focus .icon-bbbeasy-playback-podcast,
                            .ant-btn-background-ghost.ant-btn-primary:hover .icon-bbbeasy-activity-reports,
                            .ant-btn-background-ghost.ant-btn-primary:focus .icon-bbbeasy-activity-reports {
                                color: #ffffff !important;
                            }
                            /* Sider New button */
                            button.sider-new-btn,
                            .ant-dropdown-trigger.sider-new-btn {
                                background: ${settings.brand_color} !important;
                                border-color: ${settings.brand_color} !important;
                                color: #ffffff !important;
                            }
                            button.sider-new-btn:hover,
                            button.sider-new-btn:focus,
                            .ant-dropdown-trigger.sider-new-btn:hover,
                            .ant-dropdown-trigger.sider-new-btn:focus {
                                background: ${settings.brand_color}cc !important;
                                border-color: ${settings.brand_color}cc !important;
                                color: #ffffff !important;
                            }
                            /* Back to Home button */
                            .color-blue {
                                background: ${settings.brand_color} !important;
                                border-color: ${settings.brand_color} !important;
                                color: #ffffff !important;
                            }
                            .color-blue:hover,
                            .color-blue:focus {
                                background: ${settings.brand_color}cc !important;
                                border-color: ${settings.brand_color}cc !important;
                            }
                            /* Sider trigger */
                            .ant-layout-sider-trigger {
                                background: ${settings.brand_color} !important;
                            }
                            /* Menu selected */
                            .ant-menu-item-selected,
                            .ant-menu-submenu-selected > .ant-menu-submenu-title {
                                color: ${settings.brand_color} !important;
                            }
                            .ant-menu-item-selected::after {
                                border-right-color: ${settings.brand_color} !important;
                            }
                        `;
                    }
                    if (settings.default_font_size) {
                        setDefaultFontSize(settings.default_font_size);
                        document.documentElement.style.setProperty('--bbbeasy-font-size', settings.default_font_size + 'px');
                    }
                    if (settings.border_radius) {
                        setBorderRadius(settings.border_radius);
                        document.documentElement.style.setProperty('--bbbeasy-border-radius', settings.border_radius + 'px');
                    }
                    if (settings.wireframe_style !== undefined) {
                        setWireframeStyle(settings.wireframe_style);
                        document.documentElement.style.setProperty('--bbbeasy-wireframe', settings.wireframe_style ? '1' : '0');
                        document.documentElement.setAttribute('data-wireframe', settings.wireframe_style ? '1' : '0');
                    }
                }
            })
            .catch((error) => {
                console.error('Error fetching settings:', error);
            });
    }, []);

    useEffect(() => {
        const user: UserType | null = AuthService.getCurrentUser();
        const session: SessionType | null = AuthService.getCurrentSession();
        if (user && session) {
            setCurrentUser(user);
            setCurrentSession(session);
            setIsLogged(true);

            const allowedGroups = Object.keys(user.permissions ?? {});
            if (allowedGroups.length > 0) {
                if (AuthService.isAllowedGroup(allowedGroups, 'logs')) {
                    Logger.info(logs);
                }
                if (AuthService.isAllowedGroup(allowedGroups, 'rooms')) {
                    getRooms(user.id);
                }
                if (AuthService.isAllowedGroup(allowedGroups, 'labels')) {
                    getLabels();
                }
                if (AuthService.isAllowedGroup(allowedGroups, 'presets')) {
                    getPresets(user.id);
                }
            }
        }
    }, [getRooms, getLabels, getPresets, logs]);

    return (
        <StyleProvider hashPriority="high" transformers={[legacyLogicalPropertiesTransformer]}>
            <Layout className={LocaleService.direction === 'rtl' ? 'page-layout-content-rtl' : 'page-layout-content'}>
                <ConfigProvider
                    key={brandColor}
                    theme={customTheme}
                    locale={LocaleService.antLocale}
                    direction={LocaleService.direction}
                    componentSize="large"
                >
                    <UserContext.Provider key={authViewKey} value={userProvider}>
                        <DataContext.Provider value={dataProvider}>
                            {isAuthenticated && isSider && <AppSider presets={dataPresets} />}
                            <Layout className="page-layout-body">
                                <AppHeader />
                                <Content className="site-content">
                                    <Router routes={routes} />
                                </Content>
                                <AppFooter />
                            </Layout>
                        </DataContext.Provider>
                    </UserContext.Provider>
                </ConfigProvider>
                <FloatButton.BackTop />
            </Layout>
        </StyleProvider>
    );
};

export default withTranslation()(App);
