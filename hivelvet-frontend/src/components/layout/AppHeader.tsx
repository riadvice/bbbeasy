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
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
} from 'antd';
import { SearchOutlined, GlobalOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';

import { Languages } from '../Languages';
import { INSTALLER_FEATURE } from '../../constants';
import LocaleService from '../../services/locale.service';
import AuthService from '../../services/auth.service';

import { LanguageType } from '../../types/LanguageType';
import { UserContext } from '../../lib/UserContext';

import { DataContext } from 'lib/RoomsContext';

import { RoomType } from 'types/RoomType';

import DynamicIcon from 'components/DynamicIcon';

const { Header } = Layout;
const { Title, Text, Paragraph } = Typography;

const AppHeader = () => {
    const { isLogged, setIsLogged, currentUser, setCurrentUser, setCurrentSession } = React.useContext(UserContext);
    const currentLocale = LocaleService.language;
    const result: LanguageType[] = Languages.filter((item) => item.value == currentLocale);
    const language: string = result[0].name;
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const navigate = useNavigate();
    const dataContext = React.useContext(DataContext);

    const [rooms, setRooms] = React.useState<RoomType[]>(dataContext.dataRooms);

    const location = useLocation();

    const [searchForm] = Form.useForm();

    const logout = () => {
        AuthService.logout()
            .then(() => {
                localStorage.removeItem('user');
                setCurrentUser(null);
                localStorage.removeItem('session');
                setCurrentSession(null);
                setIsLogged(false);
                return <Navigate to="/login" />;
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
                            <img className="header-logo-image" src="/images/logo_01.png" alt="Logo" />
                        </Link>
                        <Space size="large">
                            {dropdownLang}
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
                        </Space>
                    </Paragraph>
                ) : (
                    <Row align="middle">
                        <Col span={14} offset={5}>
                            <Form form={searchForm}>
                                <Form.Item name="search" style={{ marginBottom: 0 }}>
                                    <Input
                                        onPressEnter={location.pathname.includes('rooms') ? handleFilter : null}
                                        className="search-input global-search"
                                        size="middle"
                                        placeholder={
                                            location.pathname.includes('rooms') ? t('search_all_rooms') : t('search')
                                        }
                                        allowClear
                                        suffix={
                                            <SearchOutlined
                                                onClick={location.pathname.includes('rooms') ? handleFilter : null}
                                            />
                                        }
                                        bordered={false}
                                    />
                                </Form.Item>
                            </Form>
                        </Col>
                        <Col span={5} className="text-end">
                            <Space size="middle">
                                {dropdownLang}
                                <Dropdown
                                    overlay={menuProfile}
                                    overlayClassName="profil-btn-dropdown"
                                    placement={LocaleService.direction == 'rtl' ? 'bottomLeft' : 'bottomRight'}
                                    arrow
                                    trigger={['click']}
                                >
                                    <Button type="primary" icon={<UserOutlined />} className="profil-btn" />
                                </Dropdown>
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
