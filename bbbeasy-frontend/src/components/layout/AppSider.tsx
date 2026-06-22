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

import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button, Dropdown, Layout, Menu } from 'antd';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import DynamicIcon from '../DynamicIcon';
import { useTranslation, withTranslation } from 'react-i18next';

import { Location } from 'history';

import { getRandomString } from '../../types/getRandomString';

import { AddRoomForm } from '../AddRoomForm';
import { PresetType } from '../../types/PresetType';
import { LabelType } from '../../types/LabelType';
import AddLabelForm from 'components/AddLabelForm';
import AddPresetForm from 'components/AddPresetForm';

import AuthService from '../../services/auth.service';
import MenuService from '../../services/menu.service';
import { UserType } from '../../types/UserType';
import { MenuType } from '../../types/MenuType';
import settingsService from 'services/settings.service';
import { SettingsType } from 'types/SettingsType';

const { Sider } = Layout;
const { SubMenu } = Menu;

type formType = {
    name?: string;
    shortlink?: string;
    preset?: PresetType;
    labels?: LabelType[];
};

type Props = {
    presets?: PresetType[];
};

const AppSider = (props: Props) => {
    const initialAddValues: formType = {
        name: '',
        shortlink: getRandomString(),
        preset: undefined,
        labels: [],
    };

    const [isModalVisibleRoom, setIsModalVisibleRoom] = React.useState<boolean>(false);
    const [isModalVisibleLabel, setIsModalVisibleLabel] = React.useState<boolean>(false);
    const [isModalVisiblePreset, setIsModalVisiblePreset] = React.useState<boolean>(false);

    const [menuItems, setMenuItems] = React.useState<MenuType[]>([]);
    const [newMenuItems, setNewMenuItems] = React.useState<string[]>([]);
    const navigate = useNavigate();

    const location: Location = useLocation();
    const [currentPath, setCurrentPath] = React.useState<string>(location.pathname);
    const { t } = useTranslation();
    const [logo, setLogo] = React.useState<string>('');

    useEffect(() => {
        const user: UserType = AuthService.getCurrentUser();
        const menuSider = MenuService.getMenuSider(user.permissions);

        setMenuItems(menuSider.items);
        setNewMenuItems(menuSider.news);
        settingsService
            .collect_settings()
            .then((response) => {
                const settings: SettingsType = response.data;
                setLogo(settings.logo);
            })
            .catch((error) => {
                console.log(error);
            });
        if (currentPath.startsWith('/r/')) {
            const index = menuSider.items.findIndex((item) => item.name === 'recordings');
            if (index !== -1) {
                setCurrentPath(menuSider.items[index].path);
            }
        }

        if (currentPath == '/login') {
            const defaultRoute = menuSider.defaultRoute;
            if (defaultRoute != '') {
                navigate(defaultRoute);
                setCurrentPath(defaultRoute);
            }
        }
    }, []);

    const handleClick = (e) => {
        setCurrentPath(e.key);
    };
    return (
        <>
            {menuItems.length != 0 && (
                <Sider className="site-sider">
                    <div className="logo">
                        <Link to={'/'}>
                            <img
                                className="sider-logo-image"
                                src={logo ? process.env.REACT_APP_API_URL + '/' + logo : '/images/logo_01.png'}
                                alt="Logo"
                            />
                        </Link>
                    </div>
                    <div className="menu-sider">
                        {newMenuItems.length != 0 && (
                            <>
                                <Dropdown
                                    overlay={
                                        <Menu>
                                            {newMenuItems.includes('rooms') && (
                                                <Menu.Item key="1" onClick={() => setIsModalVisibleRoom(true)}>
                                                    <span>{t('room')}</span>
                                                </Menu.Item>
                                            )}
                                            {newMenuItems.includes('labels') && (
                                                <Menu.Item key="2" onClick={() => setIsModalVisibleLabel(true)}>
                                                    {t('label')}
                                                </Menu.Item>
                                            )}
                                            {newMenuItems.includes('presets') && (
                                                <Menu.Item key="3" onClick={() => setIsModalVisiblePreset(true)}>
                                                    {t('preset.label')}
                                                </Menu.Item>
                                            )}
                                        </Menu>
                                    }
                                    trigger={['click']}
                                >
                                    <Button size="middle" className="sider-new-btn">
                                        <PlusOutlined /> {t('new')} <DownOutlined />
                                    </Button>
                                </Dropdown>

                                <>
                                    {newMenuItems.includes('rooms') && (
                                        <AddRoomForm
                                            isModalShow={isModalVisibleRoom}
                                            close={() => setIsModalVisibleRoom(false)}
                                            shortlink={initialAddValues.shortlink}
                                            initialAddValues={initialAddValues}
                                            presets={props.presets}
                                        />
                                    )}
                                    {newMenuItems.includes('labels') && (
                                        <AddLabelForm
                                            isModalShow={isModalVisibleLabel}
                                            close={() => setIsModalVisibleLabel(false)}
                                            defaultColor="#fbbc0b"
                                        />
                                    )}
                                    {newMenuItems.includes('presets') && (
                                        <AddPresetForm
                                            isModalShow={isModalVisiblePreset}
                                            close={() => setIsModalVisiblePreset(false)}
                                        />
                                    )}
                                </>
                            </>
                        )}

                        <Menu
                            className="site-menu"
                            mode="inline"
                            theme="light"
                            onClick={handleClick}
                            selectedKeys={[currentPath]}
                            defaultOpenKeys={['sub1']}
                        >
                            {menuItems.map((item) =>
                                item.children != null ? (
                                    <SubMenu
                                        key={item.path}
                                        icon={<DynamicIcon type={item.icon} />}
                                        title={t(item.name)}
                                    >
                                        {item.children.map((subItem) => (
                                            <Menu.Item key={subItem.path} icon={<DynamicIcon type={subItem.icon} />}>
                                                <Link to={subItem.path}>{t(subItem.name)}</Link>
                                            </Menu.Item>
                                        ))}
                                    </SubMenu>
                                ) : (
                                    <Menu.Item key={item.path} icon={<DynamicIcon type={item.icon} />}>
                                        {item.path.includes('http') ? (
                                            <a target="_blank" rel="noopener noreferrer" href={item.path}>
                                                {t(item.name)}
                                            </a>
                                        ) : (
                                            <Link to={item.path}>{t(item.name)}</Link>
                                        )}
                                    </Menu.Item>
                                )
                            )}
                        </Menu>
                    </div>
                </Sider>
            )}
        </>
    );
};

export default withTranslation()(AppSider);
