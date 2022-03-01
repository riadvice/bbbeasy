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
import { PlusOutlined, DownOutlined } from "@ant-design/icons";
import DynamicIcon from "./DynamicIcon";

const { Sider } = Layout;
const { SubMenu } = Menu;

const AppSider = () => {
    const location = useLocation();
    const [currentPath, setCurrentPath] = React.useState(location.pathname);

    const newMenu = (
        <Menu>
            <Menu.Item key="1">Room</Menu.Item>
            <Menu.Item key="2">Label</Menu.Item>
            <Menu.Item key="3">Preset</Menu.Item>
        </Menu>
    );
    const menuData = [
        {
            name: 'Rooms',
            icon: 'UserOutlined',
            path: '/home',
        },
        {
            name: 'Labels',
            icon: 'TagsOutlined',
            path: '/labels',
        },
        {
            name: 'Presets',
            icon: 'UserAddOutlined',
            path: '/presets',
        },
        {
            name: 'Settings',
            icon: 'ContainerOutlined',
            path: 'sub1',
            children: [
                {
                    name: 'Company & Branding',
                    path: '/settings/company',
                },
                {
                    name: 'Users',
                    path: '/settings/users',
                },
                {
                    name: 'Roles',
                    path: '/settings/roles',
                },
                {
                    name: 'Notifications',
                    path: '/settings/notifications',
                },
                {
                    name: 'BigBlueButton',
                    path: '/settings/bigbluebutton',
                },
            ],
        },
        {
            name: 'Help',
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
                    <PlusOutlined /> New <DownOutlined />
                </Button>
            </Dropdown>

            <Menu
                className="site-menu"
                mode="inline"
                onClick={handleClick}
                selectedKeys={[currentPath]}
                defaultSelectedKeys={['/home']}
                defaultOpenKeys={['sub1']}
            >
                {menuData.map((item) =>
                    item.children != null ? (
                        <SubMenu key={item.path} icon={<DynamicIcon type={item.icon} />} title={item.name}>
                            {item.children.map((subItem) => (
                                <Menu.Item
                                    key={subItem.path}
                                >
                                    <Link to={subItem.path}>{subItem.name}</Link>
                                </Menu.Item>
                            ))}
                        </SubMenu>
                    ) : (
                        <Menu.Item key={item.path} icon={<DynamicIcon type={item.icon} />}>
                            {item.path.includes('http') ? (
                                <a target="_blank" rel="noopener noreferrer" href={item.path}>
                                    {item.name}
                                </a>
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

export default AppSider;
