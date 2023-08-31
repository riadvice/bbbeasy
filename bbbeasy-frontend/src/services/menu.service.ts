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

import { MenuType } from '../types/MenuType';
import { MenuSiderType } from '../types/MenuSiderType';

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
        if (addActionFunction != null) {
            addActionFunction(key);
        }
    }
};

const addSettings = (keys: string[], items: MenuType[]) => {
    const subItems: MenuType[] = [];

    addItemIfExist(
        'settings',
        {
            name: 'company_branding',
            icon: 'FormatPainterOutlined',
            path: '/settings/branding',
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
    addItemIfExist(
        'users',
        {
            name: 'users',
            icon: 'TeamOutlined',
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
        'settings',
        {
            name: 'administration',
            icon: 'SettingOutlined',
            path: '/settings/administration',
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

    if (subItems.length != 0) {
        items.push({
            name: 'settings',
            icon: 'General-settings',
            path: 'sub1',
            children: subItems,
        });
    }
};

class MenuService {
    getMenuSider(userPermissions: object): MenuSiderType {
        const items: MenuType[] = [];
        const news: string[] = [];
        let defaultRoute = '';

        if (Object.keys(userPermissions).length != 0) {
            const keys = Object.keys(userPermissions);

            const addActionExist = (key: string) => {
                if (userPermissions[key].includes('add')) {
                    news.push(key);
                }
            };

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
                'recordings',
                {
                    name: 'recordings',
                    icon: 'playback-presentation',
                    path: '/recordings',
                },
                keys,
                items
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

        if (items.length != 0) {
            if (items[0].children == null) {
                if (items[0].path.startsWith('http')) {
                    defaultRoute = '/profile';
                } else {
                    defaultRoute = items[0].path;
                }
            } else {
                defaultRoute = items[0].children[0].path;
            }
        }

        return { items: items, news: news, defaultRoute: defaultRoute };
    }
}

export default new MenuService();
