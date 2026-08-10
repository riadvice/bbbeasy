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
} from '@ant-design/icons';
import DynamicIcon from './DynamicIcon';
import settingsService from 'services/settings.service';

const { Title, Paragraph } = Typography;

const RoomIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const MicOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.97c0-.06.02-.11.02-.16V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.79zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
    </svg>
);

const ExpandIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);

const HandIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.97c0-.06.02-.11.02-.16V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.79zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
    </svg>
);

const ShieldIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const CameraOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const SpeakerIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

const ActionEmojiIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
);

const ActionFullscreenIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
);

const ActionQuestionIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const ActionChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const ActionCalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const ActionMoreIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
    </svg>
);

const LandingPage = () => {
    const [platformName, setPlatformName] = React.useState<string>('');
    const [activeTab, setActiveTab] = React.useState<string>('My Table');
    const navigate = useNavigate();
    useEffect(() => {
        settingsService.collect_settings().then((result) => {
            setPlatformName(result.data.platform_name);
        });
    }, []);

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
                    <div className="bbb-classroom-widget">
                        <div className="classroom-frame">
                            <div className="classroom-topbar">
                                <div className="room-tag">
                                    <RoomIcon />
                                    <span className="room-tag-prefix">Room:</span>
                                    <span>Math-Class-01</span>
                                </div>
                                <div className="audio-hd-tag">
                                    <SpeakerIcon />
                                    <span className="audio-bars" aria-hidden="true">
                                        <span />
                                        <span />
                                        <span />
                                    </span>
                                    <span>HD Audio</span>
                                </div>
                            </div>

                            <div className="classroom-body">
                                <div className="classroom-left">
                                    <div>
                                        <div className="sec-title">Instructors</div>
                                        <div className="video-tile instructor-tile">
                                            <div className="tile-avatar avatar-inst">👩‍🏫</div>
                                            <div className="tile-footer">
                                                <span className="user-lbl">Instructor (She-Her)</span>
                                            </div>
                                            <div className="expand-icn">
                                                <ExpandIcon />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="sec-title">Podium</div>
                                        <div className="video-tile podium-tile">
                                            <div className="tile-avatar avatar-podium-1">J</div>
                                            <div className="tile-footer">
                                                <div className="mute-icn">
                                                    <MicOffIcon />
                                                </div>
                                                <span className="user-lbl">Jon (guest)</span>
                                            </div>
                                        </div>
                                        <div className="video-tile podium-tile">
                                            <div className="tile-avatar avatar-podium-2">A</div>
                                            <div className="tile-footer">
                                                <div className="mute-icn">
                                                    <MicOffIcon />
                                                </div>
                                                <span className="user-lbl">Alicia (guest)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="classroom-center">
                                    <div className="tab-bar">
                                        {['My Table', 'Class share', "Instructor's video"].map((tab) => (
                                            <button
                                                key={tab}
                                                type="button"
                                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                                onClick={() => setActiveTab(tab)}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="table-grid">
                                        <div className="video-tile grid-tile">
                                            <div className="ta-badge-tag">TA</div>
                                            <div className="grid-avatar grid-avatar-ta">
                                                <div className="speaking-ring" />
                                                👩🏻‍💻
                                            </div>
                                            <div className="tile-footer">
                                                <div className="mute-icn">
                                                    <MicOffIcon />
                                                </div>
                                                <span className="user-lbl">Tatiana</span>
                                            </div>
                                        </div>

                                        <div className="video-tile grid-tile">
                                            <div className="hand-badge">
                                                <HandIcon />
                                            </div>
                                            <div className="grid-avatar grid-avatar-a">A</div>
                                            <div className="tile-footer">
                                                <div className="mute-icn">
                                                    <MicOffIcon />
                                                </div>
                                                <span className="user-lbl">Alicia (guest)</span>
                                            </div>
                                        </div>

                                        <div className="video-tile grid-tile">
                                            <div className="grid-avatar grid-avatar-b">B</div>
                                            <div className="tile-footer">
                                                <div className="mute-icn">
                                                    <MicOffIcon />
                                                </div>
                                                <span className="user-lbl">Brandon (guest)</span>
                                            </div>
                                        </div>

                                        <div className="video-tile grid-tile">
                                            <div className="grid-avatar grid-avatar-c">C</div>
                                            <div className="tile-footer">
                                                <div className="mute-icn">
                                                    <MicOffIcon />
                                                </div>
                                                <span className="user-lbl">Colin (guest)</span>
                                            </div>
                                        </div>

                                        <div className="video-tile grid-tile">
                                            <div className="hand-badge">
                                                <HandIcon />
                                            </div>
                                            <div className="grid-avatar grid-avatar-j">J</div>
                                            <div className="tile-footer">
                                                <div className="mute-icn">
                                                    <MicOffIcon />
                                                </div>
                                                <span className="user-lbl">Jon (guest)</span>
                                            </div>
                                        </div>

                                        <div className="video-tile grid-tile add-tile">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="classroom-right">
                                    <button type="button" className="raise-hand-main" title="Lever la main">
                                        <HandIcon />
                                    </button>

                                    <div className="quick-actions-grid">
                                        <button type="button" className="act-btn" title="Émojis">
                                            <ActionEmojiIcon />
                                        </button>
                                        <button type="button" className="act-btn" title="Plein écran">
                                            <ActionFullscreenIcon />
                                        </button>
                                        <button type="button" className="act-btn" title="Poser une question">
                                            <ActionQuestionIcon />
                                        </button>
                                        <button type="button" className="act-btn" title="Chat en direct">
                                            <ActionChatIcon />
                                        </button>
                                        <button type="button" className="act-btn" title="Agenda">
                                            <ActionCalendarIcon />
                                        </button>
                                        <button type="button" className="act-btn" title="Plus d'options">
                                            <ActionMoreIcon />
                                        </button>
                                    </div>

                                    <div className="room-mode-box">
                                        <div className="mode-title">Room mode</div>
                                        <div className="mode-sub">Audio only</div>
                                    </div>

                                    <div className="bottom-media-bar">
                                        <div className="media-circle off" title="Caméra coupée">
                                            <CameraOffIcon />
                                        </div>
                                        <div className="media-circle main-speaker" title="Haut-parleur actif">
                                            <SpeakerIcon />
                                        </div>
                                        <div className="media-circle off" title="Micro coupé">
                                            <MicOffIcon />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="encryption-pill">
                            <ShieldIcon />
                            <span>End-to-end Encryption</span>
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
