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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, withTranslation } from 'react-i18next';

import { Row, Col, Typography, Avatar, Button } from 'antd';
import { AppstoreAddOutlined, BgColorsOutlined, PlayCircleOutlined, ControlOutlined, ReadOutlined, AudioOutlined, SafetyOutlined } from '@ant-design/icons';
import DynamicIcon from './DynamicIcon';
import settingsService from 'services/settings.service';

const { Title, Paragraph } = Typography;

const LandingPage = () => {
    const [platformName, setPlatformName] = React.useState<string>('');
    const navigate = useNavigate();
    settingsService.collect_settings().then((result) => {
        setPlatformName(result.data.platform_name);
    });

    return (
        <>
            <Row justify="center" align="top" className="landing-content">
                <Col span={12} className="hero-content">
                    <div className="tag">
                        <span className="dot" />
                        <Trans i18nKey="bigbluebutton" />
                    </div>
                    <Title>
                        <Trans i18nKey="welcome_platformname"> Welcome to {{ platformName: platformName }}</Trans>
                    </Title>
                    <p className="mb-30">
                        <Trans i18nKey="create_customizable_rooms" />
                        <strong>
                            {' '}
                            <Trans i18nKey="bigbluebutton" />
                        </strong>
                        . Solution professionnelle et sécurisée pour vos visioconférences.
                    </p>
                    <Paragraph className="landing-btns">
                        <Button type="primary" onClick={() => navigate('/login')}>
                            <Trans i18nKey="login" />
                        </Button>
                        <Button className="color-primary text-color-primary" onClick={() => navigate('/register')}>
                            <Trans i18nKey="sign-up" />
                        </Button>
                    </Paragraph>
                </Col>
                <Col span={12} className="hero-visual">
                    <div className="mockup-card main-card">
                        <div className="mockup-head">
                            <span className="mock-tag">
                                <ReadOutlined /> Classe virtuelle BBBEasy
                            </span>
                            <span className="mock-count">128 Participants Connectés</span>
                        </div>
                        <div className="mockup-grid">
                            <div className="mock-participant">
                                <span className="mock-avatar">JD</span>
                                <span className="mock-name">John Doe</span>
                            </div>
                            <div className="mock-participant">
                                <span className="mock-avatar mock-orange">SM</span>
                                <span className="mock-name">Sarah M.</span>
                            </div>
                            <div className="mock-participant">
                                <span className="mock-avatar mock-purple">AK</span>
                                <span className="mock-name">Alex K.</span>
                            </div>
                            <div className="mock-participant">
                                <span className="mock-avatar mock-green">ML</span>
                                <span className="mock-name">Maria L.</span>
                            </div>
                        </div>
                        <div className="mockup-footer">
                            <span>
                                <AudioOutlined /> HD Audio
                            </span>
                            <span>
                                <SafetyOutlined /> End-to-end Encryption
                            </span>
                        </div>
                    </div>
                </Col>
            </Row>
            <div className="section-head">
                <Title level={2}>
                    Powerful <span className="gradient-text">Features</span>
                </Title>
                <p>Everything you need to run seamless online sessions</p>
            </div>
            <Row gutter={[40, 8]} justify="center" className="features text-center">
                <Col xs={24} sm={12} md={12} lg={6} className="card-feat">
                    <Avatar size={45} icon={<AppstoreAddOutlined />} className="ant-btn-primary bbbeasy-btn" />
                    <p>
                        <Trans i18nKey="personal-rooms" />
                    </p>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6} className="card-feat">
                    <Avatar size={45} icon={<BgColorsOutlined />} className="ant-btn-primary bbbeasy-btn" />
                    <p>
                        <Trans i18nKey="full-brandings" />
                    </p>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6} className="card-feat">
                    <Avatar size={45} icon={<PlayCircleOutlined />} className="ant-btn-primary bbbeasy-btn" />
                    <p>
                        <Trans i18nKey="recordings-management" />
                    </p>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6} className="card-feat">
                    <Avatar size={45} icon={<ControlOutlined />} className="ant-btn-primary bbbeasy-btn" />
                    <p>
                        <Trans i18nKey="flexible-configuration" />
                    </p>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6} className="card-feat">
                    <Avatar
                        size={45}
                        icon={<DynamicIcon type={'ZcaleRight'} />}
                        className="ant-btn-primary bbbeasy-btn bbbeasy-icon"
                    />
                    <p>
                        <Trans i18nKey="zcaleright" />
                        <br />
                        <Trans i18nKey="support" />
                    </p>
                </Col>
            </Row>
        </>
    );
};

export default withTranslation()(LandingPage);
