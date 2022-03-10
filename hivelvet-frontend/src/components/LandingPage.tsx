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

import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Row, Col, Typography, Avatar } from 'antd';
import { AppstoreAddOutlined, BgColorsOutlined, PlayCircleOutlined, ControlOutlined } from '@ant-design/icons';
import DynamicIcon from './DynamicIcon';
import { Trans, withTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

class LandingPage extends Component<any, any> {
    render() {
        return (
            <>
                <Row justify="center" align="top" className="landing-content">
                    <Col span={12}>
                        <Title>
                            <Trans i18nKey="welcome_hivelvet" />
                        </Title>
                        <p className="mb-30">
                            <Trans i18nKey="create_customizable_rooms" />
                            <strong> BigBlueButton</strong>
                        </p>
                        <Paragraph className="landing-btn">
                            <Link className="ant-btn ant-btn-primary text-white" to={'/login'}>
                                <Trans i18nKey="login" />
                            </Link>
                            <Link className={'ant-btn color-primary'} to={'/register'}>
                                <Trans i18nKey="sign-up" />
                            </Link>
                        </Paragraph>
                    </Col>
                    <Col span={12} className="text-end">
                        <img className="landing-img" src="/images/landing2.png" />
                    </Col>
                </Row>
                <Row gutter={[40, 8]} justify="center" className="features text-center">
                    <Col span={3}>
                        <Avatar size={45} icon={<AppstoreAddOutlined />} className="ant-btn-primary hivelvet-btn" />
                        <p>
                            <Trans i18nKey="personal-rooms" />
                        </p>
                    </Col>
                    <Col span={3}>
                        <Avatar size={45} icon={<BgColorsOutlined />} className="ant-btn-primary hivelvet-btn" />
                        <p>
                            <Trans i18nKey="full-brandings" />
                        </p>
                    </Col>
                    <Col span={3}>
                        <Avatar size={45} icon={<PlayCircleOutlined />} className="ant-btn-primary hivelvet-btn" />
                        <p>
                            <Trans i18nKey="recordings-management" />
                        </p>
                    </Col>
                    <Col span={3}>
                        <Avatar size={45} icon={<ControlOutlined />} className="ant-btn-primary hivelvet-btn" />
                        <p>
                            <Trans i18nKey="flexible-configuration" />
                        </p>
                    </Col>
                    <Col span={3}>
                        <Avatar size={45} icon={<DynamicIcon type={'ZcaleRight'} />} className="ant-btn-primary hivelvet-btn hivelvet-icon" />
                        <p>
                            <Trans i18nKey="zcaleright" />
                            <br />
                            <Trans i18nKey="support" />
                        </p>
                    </Col>
                </Row>
            </>
        );
    }
}

export default withTranslation()(LandingPage);
