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

import { getRandomString } from '../../types/getRandomString';

import { AddRoomForm } from '../AddRoomForm';
import { PresetType } from '../../types/PresetType';
import { LabelType } from '../../types/LabelType';

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
        preset: undefined,
        labels: [],
    };
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [menuItems, setMenuItems] = React.useState<MenuType[]>([]);
    const [newMenuItems, setNewMenuItems] = React.useState<string[]>([]);
    const location: Location = useLocation();
    const [currentPath, setCurrentPath] = React.useState<string>(location.pathname);
    const { t } = useTranslation();
    const comp = useRef();

    type addActionType = (key: string) => void;

    const addItemIfExist = (
        key: string,
        menuItem: MenuType,
        keys: string[],
        items: MenuType[],
        addActionFunction?: addActionType
    ) => {
        if (keys.includes(key)) {
            items.push(menuItem);
            addActionFunction != null ? addActionFunction(key) : null;
        }
    };

    const addSettings = (keys: string[], items: MenuType[]) => {
        const subItems: MenuType[] = [];

        addItemIfExist(
            'settings',
            {
                name: 'company_branding',
                icon: 'BgColorsOutlined',
                path: '/settings/branding',
            },
            keys,
            subItems
        );
        addItemIfExist(
            'users',
            {
                name: 'users',
                icon: 'UserOutlined',
                path: '/settings/users',
            },
            keys,
            subItems
        );
        addItemIfExist(
            'roles',
            {
                name: 'roles',
                icon: 'Role',
                path: '/settings/roles',
            },
            keys,
            subItems
        );
        addItemIfExist(
            'notifications',
            {
                name: 'notifications',
                icon: 'BellOutlined',
                path: '/settings/notifications',
            },
            keys,
            subItems
        );
        addItemIfExist(
            'preset_settings',
            {
                name: 'bigbluebutton',
                icon: 'Bigbluebutton',
                path: '/settings/bigbluebutton',
            },
            keys,
            subItems
        );

        if (subItems.length != 0) {
            items.push({
                name: 'settings',
                icon: 'General-settings',
                path: 'sub1',
                children: subItems,
            });
        }
    };

    useEffect(() => {
        const user: UserType = AuthService.getCurrentUser();
        const items: MenuType[] = [];
        const newItems: string[] = [];
        const userPermissions = user.permissions;
        const addActionExist = (key: string) => {
            if (userPermissions[key].includes('add')) {
                newItems.push(key);
            }
        };
        if (Object.keys(userPermissions).length != 0) {
            const keys = Object.keys(userPermissions);

            addItemIfExist(
                'rooms',
                {
                    name: 'rooms',
                    icon: 'Room',
                    path: '/rooms',
                },
                keys,
                items,
                addActionExist
            );
            addItemIfExist(
                'labels',
                {
                    name: 'labels',
                    icon: 'TagsOutlined',
                    path: '/labels',
                },
                keys,
                items,
                addActionExist
            );
            addItemIfExist(
                'presets',
                {
                    name: 'presets',
                    icon: 'Preset',
                    path: '/presets',
                },
                keys,
                items,
                addActionExist
            );

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
                            <Dropdown
                                overlay={
                                    <Menu>
                                        {newMenuItems.includes('rooms') && (
                                            <Menu.Item key="1" onClick={() => setIsModalVisible(true)}>
                                                <span>{t('room')}</span>
                                            </Menu.Item>
                                        )}
                                        {newMenuItems.includes('labels') && <Menu.Item key="2">{t('label')}</Menu.Item>}
                                        {newMenuItems.includes('presets') && (
                                            <Menu.Item key="3">{t('preset.label')}</Menu.Item>
                                        )}
                                    </Menu>
                                }
                            >
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
            {newMenuItems.length != 0 ? (
                <>
                    {newMenuItems.includes('rooms') && (
                        <AddRoomForm
                            defaultColor="#fbbc0b"
                            isModalShow={isModalVisible}
                            close={() => setIsModalVisible(false)}
                            shortlink={'/hv/' + initialAddValues.shortlink}
                            initialAddValues={initialAddValues}
                        />
                    )}
                </>
            ) : null}
        </>
    );
};

export default withTranslation()(AppSider);
