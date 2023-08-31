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
import { apiRoutes } from 'routing/backend-config';

const { Header } = Layout;
const { Title, Text, Paragraph } = Typography;

const AppHeader = () => {
    const { isLogged, setIsLogged, currentUser, setCurrentUser, setCurrentSession } = React.useContext(UserContext);
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
    if (isLoginPage) {
        setIsLogged(false);
    }
    settingsService
        .collect_settings()
        .then((response) => {
            const settings: SettingsType = response.data;
            setLogo(settings.logo);
        })
        .catch((error) => {
            console.log(error);
        });
    const logout = () => {
        AuthService.logout()
            .then(() => {
                setIsLogged(false);
                localStorage.removeItem('user');
                setCurrentUser(null);
                localStorage.removeItem('session');
                setCurrentSession(null);
                navigate('/login');
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleChange = (e: RadioChangeEvent) => {
        const selectedLang: string = e.target.value;

        LocaleService.changeLocale(selectedLang);
    };

    const handleFilter = (e) => {
        const data = [];
        dataContext.dataRooms.map((room) => {
            const lbs = room.labels.filter((item) => item.name.toLowerCase().includes(e.target.value.toLowerCase()));

            if (lbs.length > 0) {
                data.push(room);
            }
        });

        setRooms(data);
        setIsModalVisible(true);
    };

    useEffect(() => {
        notificationService
            .collect_notification()
            .then((response) => {
                setWarningNotification(true);
                console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
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
            overlay={menuLang}
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
            overlay={
                <Menu>
                    <Menu.Item key="1" className="username-item">
                        <Text>
                            <Trans i18nKey="user_dropdown.warning_notification" />
                        </Text>
                    </Menu.Item>
                </Menu>
            }
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

    const menuProfile = (
        <Menu>
            <Menu.Item key="1" className="username-item">
                <Trans i18nKey="signed_as" /> {currentUser?.username}
                <br />
                <Text>{currentUser?.email}</Text>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="2" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
                <Trans i18nKey="user_dropdown.profile" />
            </Menu.Item>
            <Menu.Item id="logout-btn" key="3" icon={<LogoutOutlined />} onClick={() => logout()}>
                <Trans i18nKey="user_dropdown.logout" />
            </Menu.Item>
        </Menu>
    );

    return (
        <Header className="site-header">
            <>
                {!isLogged ? (
                    <Paragraph className="site-header-inner">
                        <Link to={'/'}>
                            <img
                                className="header-logo-image"
                                src={logo ? process.env.REACT_APP_API_URL + '/' + logo : '/images/logo_01.png'}
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
                            <Form form={searchForm}>
                                <Form.Item name="search" className="mb-0">
                                    <Input
                                        onPressEnter={isRoomsSearch ? handleFilter : null}
                                        className="search-input global-search"
                                        size="middle"
                                        placeholder={isRoomsSearch ? t('search_all_rooms') : t('search')}
                                        allowClear
                                        suffix={<SearchOutlined onClick={isRoomsSearch ? handleFilter : null} />}
                                        bordered={false}
                                    />
                                </Form.Item>
                            </Form>
                        </Col>
                        <Col span={5} className="text-end">
                            <Space size="middle">
                                {dropdownWarning}
                                <Dropdown
                                    overlay={menuProfile}
                                    overlayClassName="profil-btn-dropdown"
                                    placement={LocaleService.direction == 'rtl' ? 'bottomLeft' : 'bottomRight'}
                                    arrow
                                    trigger={['click']}
                                >
                                    <Button type="primary" icon={<UserOutlined />} className="profil-btn" />
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
