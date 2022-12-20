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

import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Button, Dropdown, Layout, Menu } from 'antd';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import DynamicIcon from '../DynamicIcon';
import { useTranslation, withTranslation } from 'react-i18next';

import { Location } from 'history';

import { getRandomString } from 'types/getRandomString';
import { PresetType } from 'types/PresetType';
import { LabelType } from 'types/LabelType';
import { AddRoomForm } from 'components/AddRoomForm';

import AuthService from '../../services/auth.service';
import { UserType } from '../../types/UserType';
import { MenuType } from '../../types/MenuType';

const { Sider } = Layout;
const { SubMenu } = Menu;

type formType = {
    name?: string;
    shortlink?: string;
    preset?: PresetType;
    labels?: LabelType[];
};

const AppSider = () => {
    const initialAddValues: formType = {
        name: '',
        shortlink: getRandomString(),
        preset: null,
        labels: [],
    };
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [menuItems, setMenuItems] = React.useState<MenuType[]>([]);
    const [newMenuItems, setNewMenuItems] = React.useState<string[]>([]);
    const location: Location = useLocation();
    const [currentPath, setCurrentPath] = React.useState<string>(location.pathname);
    const { t } = useTranslation();
    const comp = useRef();

    const addSettings = (keys: string[], items: MenuType[]) => {
        const subItems = [];
        if(keys.includes('settings')) {
            subItems.push({
                name: 'company_branding',
                icon: 'BgColorsOutlined',
                path: '/settings/branding',
            });
        }
        if(keys.includes('users')) {
            subItems.push({
                name: 'users',
                icon: 'UserOutlined',
                path: '/settings/users',
            });
        }
        if(keys.includes('roles')) {
            subItems.push({
                name: 'roles',
                icon: 'Role',
                path: '/settings/roles',
            });
        }
        if(keys.includes('notifications')) {
            subItems.push({
                name: 'notifications',
                icon: 'BellOutlined',
                path: '/settings/notifications',
            });
        }
        if(keys.includes('preset_settings')) {
            subItems.push({
                name: 'bigbluebutton',
                icon: 'Bigbluebutton',
                path: '/settings/bigbluebutton',
            });
        }

        if(subItems.length != 0) {
            items.push({
                name: 'settings',
                icon: 'General-settings',
                path: 'sub1',
                children: subItems,
            });
        }
    }

    useEffect(() => {
        const user: UserType = AuthService.getCurrentUser();
        const items : MenuType[] = [];
        const newItems : string[] = [];
        const userPermissions = user.permissions;
        if(Object.keys(userPermissions).length != 0) {
            const keys = Object.keys(userPermissions);
            if(keys.includes('rooms')) {
                items.push({
                    name: 'rooms',
                    icon: 'Room',
                    path: '/rooms',
                });
                userPermissions['rooms'].includes('add') ? newItems.push('room') : null;
            }
            if(keys.includes('labels')) {
                items.push({
                    name: 'labels',
                    icon: 'TagsOutlined',
                    path: '/labels',
                });
                userPermissions['labels'].includes('add') ? newItems.push('label') : null;
            }
            if(keys.includes('presets')) {
                items.push({
                    name: 'presets',
                    icon: 'Preset',
                    path: '/presets',
                });
                userPermissions['presets'].includes('add') ? newItems.push('preset') : null;
            }
            addSettings(keys, items);
        }
        items.push({
            name: 'help',
            icon: 'QuestionCircleOutlined',
            path: 'https://riadvice.tn/',
        });
        setMenuItems(items);
        setNewMenuItems(newItems);
    }, []);

    const handleClick = (e) => {
        setCurrentPath(e.key);
    };

    return (
        <>
        {menuItems.length != 0 && (
            <Sider className="site-sider" ref={comp}>
                <div className="logo">
                    <Link to={'/'}>
                        <img className="sider-logo-image" src="/images/logo_01.png" alt="Logo" />
                    </Link>
                </div>
                <div className="menu-sider">
                    {newMenuItems.length != 0 && (
                        <Dropdown overlay={
                            <Menu>
                                {newMenuItems.includes('room') && (
                                    <Menu.Item key="1" onClick={() => setIsModalVisible(true)}>
                                        <span>{t('room')}</span>
                                    </Menu.Item>
                                )}
                                {newMenuItems.includes('label') && (
                                    <Menu.Item key="2">{t('label')}</Menu.Item>
                                )}
                                {newMenuItems.includes('preset') && (
                                    <Menu.Item key="3">{t('preset.label')}</Menu.Item>
                                )}
                            </Menu>
                        }>
                            <Button size="middle" className="sider-new-btn">
                                <PlusOutlined /> {t('new')} <DownOutlined />
                            </Button>
                        </Dropdown>
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
                                    <SubMenu key={item.path} icon={<DynamicIcon type={item.icon} />} title={t(item.name)}>
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
        {newMenuItems.length != 0 ?
            <>
                {newMenuItems.includes('room') && (
                    <AddRoomForm
                        defaultColor="#fbbc0b"
                        isModalShow={isModalVisible}
                        close={() => setIsModalVisible(false)}
                        shortlink={'/hv/' + initialAddValues.shortlink}
                        initialAddValues={initialAddValues}
                    />
                )}
            </> : null
        }
        </>
    );
};

export default withTranslation()(AppSider);
