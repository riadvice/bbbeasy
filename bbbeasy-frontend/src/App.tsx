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

import React, { useEffect, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import { IRoute } from './routing/IRoute';
import Router from './routing/Router';
import { hot } from 'react-hot-loader';

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
    const [currentUser, setCurrentUser] = React.useState<UserType>(null);
    const [currentSession, setCurrentSession] = React.useState<SessionType>(null);
    const [isLogged, setIsLogged] = React.useState<boolean>(false);

    const [dataRooms, setDataRooms] = React.useState<RoomType[]>([]);
    const [dataLabels, setDataLabels] = React.useState<LabelType[]>([]);
    const [dataPresets, setDataPresets] = React.useState<PresetType[]>([]);

    const dataProvider = useMemo(
        () => ({ dataRooms, setDataRooms, dataLabels, setDataLabels, dataPresets, setDataPresets }),
        [dataRooms, setDataRooms, dataLabels, setDataLabels, dataPresets, setDataPresets]
    );

    const userProvider = useMemo(
        () => ({ isLogged, setIsLogged, currentUser, setCurrentUser, currentSession, setCurrentSession }),
        [isLogged, setIsLogged, currentUser, setCurrentUser, currentSession, setCurrentSession]
    );

    const customTheme = {
        token: {
            colorPrimary: '#fbbc0b',
            colorPrimaryHover: '#ffcf33',
            outlineColor: '#fffce6',

            colorBorder: '#dddfe1',

            colorLink: '#fbbc0b',
            colorLinkHover: '#ffcf33',
            colorLinkActive: '#ffcf33',

            borderRadiusLG: 6,
        },
    };

    const getRooms = (userId: number) => {
        RoomsService.list_rooms(userId)
            .then((response) => {
                setDataRooms(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    };
    const getLabels = () => {
        LabelsService.list_labels()
            .then((response) => {
                setDataLabels(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const getPresets = (userId: number) => {
        PresetsService.list_presets(userId)
            .then((response) => {
                setDataPresets(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    //loading page and user already logged => set current user
    useEffect(() => {
        window.addEventListener('error', (e) => {
            if (e.message.includes('ResizeObserver')) {
                const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
                const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
                if (resizeObserverErr) {
                    resizeObserverErr.setAttribute('style', 'display: none');
                }
                if (resizeObserverErrDiv) {
                    resizeObserverErrDiv.setAttribute('style', 'display: none');
                }
            }
        });
        const user: UserType = AuthService.getCurrentUser();
        const session: SessionType = AuthService.getCurrentSession();
        if (user != null && session != null) {
            setCurrentUser(user);
            setCurrentSession(session);
            setIsLogged(true);

            const allowedGroups = Object.keys(user.permissions);
            if (allowedGroups.length != 0) {
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
    }, []);

    return (
        <StyleProvider hashPriority="high" transformers={[legacyLogicalPropertiesTransformer]}>
            <Layout className={LocaleService.direction == 'rtl' ? 'page-layout-content-rtl' : 'page-layout-content'}>
                <ConfigProvider
                    theme={customTheme}
                    locale={LocaleService.antLocale}
                    direction={LocaleService.direction}
                    componentSize="large"
                >
                    <UserContext.Provider value={userProvider}>
                        <DataContext.Provider value={dataProvider}>
                            {isLogged && isSider && <AppSider presets={dataPresets} />}
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

export default withTranslation()(hot(module)(App));
