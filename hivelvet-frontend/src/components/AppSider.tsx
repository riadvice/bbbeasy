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

import React, {Component} from 'react';
import { Button, Dropdown, Layout, Menu } from 'antd';
import { PlusOutlined, DownOutlined, UserOutlined, TagsOutlined, UserAddOutlined, ContainerOutlined, QuestionCircleOutlined } from "@ant-design/icons";

const { Sider } = Layout;
const { SubMenu } = Menu;

type Props = {};

type State = {
    collapsed: boolean
};

class AppSider extends Component<Props,State> {
    state = {
        collapsed: false,
    };
    toggleCollapsed = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    render() {
        const { collapsed } = this.state;
        const menu = (
            <Menu>
                <Menu.Item key="1">
                    Room
                </Menu.Item>
                <Menu.Item key="2">
                    Label
                </Menu.Item>
                <Menu.Item key="3">
                    Preset
                </Menu.Item>
            </Menu>
        );

        return (
            <Sider
                className="site-sider"
                width={250}
                collapsible
                collapsed={collapsed}
                onCollapse={this.toggleCollapsed}
            >
                <Dropdown overlay={menu}>
                    <Button size="middle" className="sider-new-btn">
                        <PlusOutlined /> New <DownOutlined />
                    </Button>
                </Dropdown>

                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    style={{ height: '100%', borderRight: 0 }}
                >
                    <Menu.Item key="1" icon={<UserOutlined />}>Rooms</Menu.Item>
                    <Menu.Item key="2" icon={<TagsOutlined />}>Labels</Menu.Item>
                    <Menu.Item key="3" icon={<UserAddOutlined />}>Presets</Menu.Item>
                    <SubMenu key="sub1" icon={<ContainerOutlined />} title="Settings">
                        <Menu.Item key="4">Company & Branding</Menu.Item>
                        <Menu.Item key="5">Users</Menu.Item>
                        <Menu.Item key="6">Roles</Menu.Item>
                        <Menu.Item key="7">Notifications</Menu.Item>
                        <Menu.Item key="8">BigBlueButton</Menu.Item>
                    </SubMenu>
                    <Menu.Item key="9" icon={<QuestionCircleOutlined />}>Help</Menu.Item>
                </Menu>
            </Sider>
        );
    }
}

export default AppSider;
