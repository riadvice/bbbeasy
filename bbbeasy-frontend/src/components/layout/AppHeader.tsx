/**
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Layout,
    Typography,
    Radio,
    Button,
    Menu,
    Dropdown,
    Space,
    Input,
    Row,
    Col,
    RadioChangeEvent,
    Tag,
    Modal,
    Divider,
    Form,
    Badge,
    Avatar,
} from 'antd';
import { SearchOutlined, GlobalOutlined, UserOutlined, LogoutOutlined, WarningOutlined } from '@ant-design/icons';

import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';

import { Languages } from '../Languages';
import { INSTALLER_FEATURE } from '../../constants';

import { UserContext } from '../../lib/UserContext';
import { DataContext } from 'lib/RoomsContext';
import DynamicIcon from 'components/DynamicIcon';

import LocaleService from '../../services/locale.service';
import AuthService from '../../services/auth.service';

import { LanguageType } from '../../types/LanguageType';
import { RoomType } from 'types/RoomType';
import notificationService from '../../services/notification.service';

import settingsService from 'services/settings.service';
import { SettingsType } from 'types/SettingsType';
import { apiRoutes } from '../../routing/backend-config';

const { Header } = Layout;
const { Title, Text, Paragraph } = Typography;

// eslint-disable-next-line complexity
const AppHeader = () => {
    const { setIsLogged, currentUser, setCurrentUser, setCurrentSession } = React.useContext(UserContext);
    const currentLocale = LocaleService.language;
    const result: LanguageType[] = Languages.filter((item) => item.value == currentLocale);
    const language: string = result[0].name;
    const navigate = useNavigate();

    const dataContext = React.useContext(DataContext);
    const [rooms, setRooms] = React.useState<RoomType[]>(dataContext.dataRooms);
    const [warningNotification, setWarningNotification] = useState<boolean>(false);
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const location = useLocation();
    const [searchForm] = Form.useForm();
    const isRoomsSearch = location.pathname.includes('rooms');
    const [logo, setLogo] = React.useState<string>('');
    const isLoginPage = location.pathname.includes('login');
    const storedUser = AuthService.getCurrentUser();
    const storedSession = AuthService.getCurrentSession();
    const isAuthenticated = Boolean(storedUser && storedSession);

    useEffect(() => {
        settingsService
            .collect_settings()
            .then((response) => {
                const settings: SettingsType = response.data;
                setLogo(settings.logo);
            })
            .catch((error) => {
                console.log(error);
            });

        return settingsService.on_settings_updated((settings) => setLogo(settings.logo));
    }, []);
    const logout = () => {
        AuthService.logout()
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setIsLogged(false);
                AuthService.clearAuth();
                setCurrentUser(null);
                setCurrentSession(null);
                navigate('/login');
            });
    };

    const handleChange = (e: RadioChangeEvent) => {
        const selectedLang: string = e.target.value;

        LocaleService.changeLocale(selectedLang);
    };

    const handleFilter = () => {
        const query = (searchForm.getFieldValue('search') ?? '').trim().toLowerCase();
        if (query === '') {
            return;
        }

        // A room matches on its own name as well as on any of its labels, the
        // placeholder promises to search rooms and that is what people type.
        const matches = dataContext.dataRooms.filter(
            (room) =>
                room.name.toLowerCase().includes(query) ||
                room.labels.some((label) => label.name.toLowerCase().includes(query))
        );

        setRooms(matches);
        setIsModalVisible(true);
    };

    useEffect(() => {
        notificationService
            .collect_notification()
            .then((response) => {
                setWarningNotification(!response.data.configured);
            })
            .catch(() => {
                setWarningNotification(true);
            });
    }, []);

    const menuLang = (
        <Menu>
            <Radio.Group value={currentLocale} onChange={handleChange}>
                {Languages.map(({ name, key, value }) => (
                    <Menu.Item key={key}>
                        <Radio value={value}>{name}</Radio>
                    </Menu.Item>
                ))}
            </Radio.Group>
        </Menu>
    );
    const dropdownLang = (
        <Dropdown
            popupRender={() => menuLang}
            placement={LocaleService.direction == 'rtl' ? 'bottomLeft' : 'bottomRight'}
            arrow
            trigger={['click']}
        >
            <Button type="link" size="middle" className="lang-btn">
                <GlobalOutlined /> {language}
            </Button>
        </Dropdown>
    );
    const dropdownWarning = (
        <Dropdown
            menu={{
                items: [
                    {
                        key: '1',
                        className: 'username-item',
                        label: (
                            <Text>
                                <Trans i18nKey="user_dropdown.warning_notification" />
                            </Text>
                        ),
                    },
                ],
            }}
            overlayClassName="profil-btn-dropdown warning-btn-dropdown"
            disabled={!warningNotification}
            placement={LocaleService.direction == 'rtl' ? 'bottomLeft' : 'bottomRight'}
            arrow
            trigger={['click']}
            className={!warningNotification ? 'dropdownWarning' : null}
        >
            <Badge offset={LocaleService.direction == 'rtl' ? [34, 5] : [-34, 5]} count={warningNotification ? 1 : 0}>
                <Button type="primary" icon={<WarningOutlined />} className="profil-btn" />
            </Badge>
        </Dropdown>
    );

    const activeUser = currentUser ?? storedUser;
    const menuProfile = {
        items: [
            {
                key: '1',
                className: 'username-item',
                label: (
                    <>
                        <Trans i18nKey="signed_as" /> {activeUser?.username}
                        <br />
                        <Text>{activeUser?.email}</Text>
                    </>
                ),
            },
            { type: 'divider' as const },
            {
                key: '2',
                icon: <UserOutlined />,
                label: <Trans i18nKey="user_dropdown.profile" />,
                onClick: () => navigate('/profile'),
            },
            {
                key: '3',
                id: 'logout-btn',
                icon: <LogoutOutlined />,
                label: <Trans i18nKey="user_dropdown.logout" />,
                onClick: () => logout(),
            },
        ],
    };

    return (
        <Header className="site-header">
            <>
                {!isAuthenticated || isLoginPage ? (
                    <Paragraph className="site-header-inner">
                        <Link to={'/'}>
                            <img
                                className="header-logo-image"
                                src={logo ? apiRoutes.GET_FILE_URL + logo : '/images/logo_01.png'}
                                alt="Logo"
                            />
                        </Link>
                        <Space size="large">
                            {!INSTALLER_FEATURE && (
                                <>
                                    <Button className="color-primary" onClick={() => navigate('/login')}>
                                        <Trans i18nKey="login" />
                                    </Button>
                                    <Button className="color-primary" onClick={() => navigate('/register')}>
                                        <Trans i18nKey="sign-up" />
                                    </Button>
                                </>
                            )}
                            {dropdownLang}
                        </Space>
                    </Paragraph>
                ) : (
                    <Row align="middle">
                        <Col span={14} offset={5}>
                            {isRoomsSearch && (
                            <Form form={searchForm}>
                                <Form.Item name="search" className="mb-0">
                                    <Input
                                        onPressEnter={handleFilter}
                                        className="search-input global-search rooms-search-input"
                                        size="middle"
                                        placeholder={t('search_all_rooms')}
                                        allowClear
                                        suffix={<SearchOutlined className="search-submit" onClick={handleFilter} />}
                                        variant="borderless"
                                    />
                                </Form.Item>
                            </Form>
                            )}
                        </Col>
                        <Col span={5} className="text-end">
                            <Space size="middle">
                                {dropdownWarning}
                                <Dropdown
                                    menu={menuProfile}
                                    overlayClassName="profil-btn-dropdown"
                                    placement={LocaleService.direction == 'rtl' ? 'bottomLeft' : 'bottomRight'}
                                    arrow
                                    trigger={['click']}
                                >
                                    <Avatar
                                        className="profil-btn profil-avatar"
                                        src={activeUser?.avatar || undefined}
                                        icon={<UserOutlined />}
                                    />
                                </Dropdown>
                                {dropdownLang}
                            </Space>
                        </Col>
                    </Row>
                )}
            </>
            <Modal
                title={
                    <Trans i18nKey="found_results" count={rooms.length}>
                        Found {{ count: rooms.length }} results
                    </Trans>
                }
                className="search-modal"
                open={isModalVisible}
                onCancel={() => {
                    searchForm.resetFields();
                    setIsModalVisible(false);
                }}
                footer={null}
                maskClosable={false}
            >
                {rooms.map((singleRoom, index) => (
                    <>
                        <Row align="middle" justify="space-around" className="room-content">
                            <Col span={1}>
                                <DynamicIcon type="room" />
                            </Col>
                            <Col span={21}>
                                <Space direction="vertical">
                                    <Title level={3}>{singleRoom.name}</Title>
                                    <Row>
                                        {singleRoom.labels.map((item) => (
                                            <Tag key={item.id} color={item.color}>
                                                {item.name}
                                            </Tag>
                                        ))}
                                    </Row>
                                </Space>
                            </Col>
                        </Row>
                        {index < rooms.length - 1 && <Divider />}
                    </>
                ))}
            </Modal>
        </Header>
    );
};

export default withTranslation()(AppHeader);
