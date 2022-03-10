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
import { Link, useLocation } from 'react-router-dom';

import { Button, Dropdown, Layout, Menu } from 'antd';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import DynamicIcon from './DynamicIcon';
import { useTranslation, withTranslation } from 'react-i18next';

const { Sider } = Layout;
const { SubMenu } = Menu;

const AppSider = () => {
    const location = useLocation();
    const [currentPath, setCurrentPath] = React.useState(location.pathname);
    const { t } = useTranslation();
    const newMenu = (
        <Menu>
            <Menu.Item key="1">{t('room')}</Menu.Item>
            <Menu.Item key="2">{t('label')}</Menu.Item>
            <Menu.Item key="3">{t('preset')}</Menu.Item>
        </Menu>
    );
    const menuData = [
        {
            name: t('rooms'),
            icon: 'UserOutlined',
            path: '/home',
        },
        {
            name: t('labels'),
            icon: 'TagsOutlined',
            path: '/labels',
        },
        {
            name: t('presets'),
            icon: 'UserAddOutlined',
            path: '/presets',
        },
        {
            name: t('settings'),
            icon: 'ContainerOutlined',
            path: 'sub1',
            children: [
                {
                    name: t('Company') + ' & ' + t('branding'),
                    path: '/settings/company',
                },
                {
                    name: t('users'),
                    path: '/settings/users',
                },
                {
                    name: t('roles'),
                    path: '/settings/roles',
                },
                {
                    name: t('notifications'),
                    path: '/settings/notifications',
                },
                {
                    name: 'BigBlueButton',
                    path: '/settings/bigbluebutton',
                },
            ],
        },
        {
            name: t('help'),
            icon: 'QuestionCircleOutlined',
            path: 'https://riadvice.tn/',
        },
    ];
    const handleClick = (e) => {
        setCurrentPath(e.key);
    };

    return (
        <Sider className="site-sider" width={250}>
            <Dropdown overlay={newMenu}>
                <Button size="middle" className="sider-new-btn">
                    <PlusOutlined /> {t('new')} <DownOutlined />
                </Button>
            </Dropdown>

            <Menu
                className="site-menu"
                mode="inline"
                onClick={handleClick}
                selectedKeys={[currentPath]}
                defaultOpenKeys={['sub1']}
            >
                {menuData.map((item) =>
                    item.children != null ? (
                        <SubMenu key={item.path} icon={<DynamicIcon type={item.icon} />} title={item.name}>
                            {item.children.map((subItem) => (
                                <Menu.Item key={subItem.path}>
                                    <Link to={subItem.path}>{subItem.name}</Link>
                                </Menu.Item>
                            ))}
                        </SubMenu>
                    ) : (
                        <Menu.Item key={item.path} icon={<DynamicIcon type={item.icon} />}>
                            {item.path.includes('http') ? (
                                <a target="_blank" rel="noopener noreferrer" href={item.path}>{item.name}</a>
                            ) : (
                                <Link to={item.path}>{item.name}</Link>
                            )}
                        </Menu.Item>
                    )
                )}
            </Menu>
        </Sider>
    );
};

export default withTranslation()(AppSider);
