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

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, withTranslation } from 'react-i18next';

import { Row, Col, Typography, Avatar, Button } from 'antd';
import {
    AppstoreAddOutlined,
    BgColorsOutlined,
    PlayCircleOutlined,
    ControlOutlined,
    AudioOutlined,
    AudioMutedOutlined,
    SecurityScanOutlined,
} from '@ant-design/icons';
import DynamicIcon from './DynamicIcon';
import settingsService from 'services/settings.service';

const { Title, Paragraph } = Typography;

const LandingPage = () => {
    const [platformName, setPlatformName] = React.useState<string>('');
    const navigate = useNavigate();
    useEffect(() => {
        settingsService.collect_settings().then((result) => {
            setPlatformName(result.data.platform_name);
        });
    }, []);

    const participants = [
        {
            initials: 'JD',
            name: 'John Doe',
            className: 'mock-blue',
            micIcon: <AudioOutlined />,
        },
        {
            initials: 'SM',
            name: 'Sarah M.',
            className: 'mock-orange',
            micIcon: <AudioMutedOutlined />,
        },
        {
            initials: 'AK',
            name: 'Alex K.',
            className: 'mock-purple',
            micIcon: <AudioOutlined />,
        },
        {
            initials: 'ML',
            name: 'Maria L.',
            className: 'mock-green',
            micIcon: <AudioOutlined />,
        },
    ];

    return (
        <div className="landing-shell">
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
                    <div className="mockup-card mc-main">
                        <div className="mockup-head">
                            <div className="mock-tag">Room: Math-Class-01</div>
                            <div className="rec-indicator">
                                <div className="rec-dot" />
                                REC
                            </div>
                        </div>
                        <div className="mockup-grid">
                            {participants.map((participant) => (
                                <div key={participant.name} className="participant">
                                    <div className={`avatar ${participant.className}`}>{participant.initials}</div>
                                    <div className="name-tag">{participant.name}</div>
                                    <div className={`mic-icon ${participant.name === 'Sarah M.' ? 'mic-off' : ''}`}>{participant.micIcon}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mockup-card floating-ui fu-1">
                        <AudioOutlined />
                        <div className="wave-bars" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>
                        <span>HD Audio</span>
                    </div>
                    <div className="mockup-card floating-ui fu-2">
                        <SecurityScanOutlined />
                        <span>End-to-end Encryption</span>
                    </div>
                </Col>
            </Row>

            <div className="section-head">
                <Title level={2}>
                    Powerful <span className="gradient-text">Features</span>
                </Title>
                <p>Everything you need to run seamless online sessions</p>
            </div>

            <div className="features-block">
                <Row gutter={[24, 24]} justify="center" className="features text-left features-row">
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
                    <Col xs={24} sm={12} md={12} lg={6} className="card-feat card-feat-last">
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
            </div>
        </div>
    );
};

export default withTranslation()(LandingPage);
