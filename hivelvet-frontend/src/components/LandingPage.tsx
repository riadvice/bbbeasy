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
import DynamicIcon from "./DynamicIcon";
import {T} from "@transifex/react";

const { Title, Paragraph } = Typography;

class LandingPage extends Component<any, any> {
    render() {
        return (
            <>
                <Row justify="center" align="top" className="landing-content">
                    <Col span={12}>
                        <Title>Welcome to Hivelvet</Title>
                        <p className="mb-30">Create fully customisable rooms for <strong>BigBlueButton</strong></p>
                        <Paragraph className="landing-btn">
                            <Link className='ant-btn ant-btn-primary text-white' to={'/login'}>
                                {' '}
                                <T _str="Login"/>{' '}
                            </Link>
                            <Link className={'ant-btn color-primary'} to={'/register'}>
                                {' '}
                                <T _str="Sign up"/>{' '}
                            </Link>
                        </Paragraph>
                    </Col>
                    <Col span={12} className="text-end">
                        <img className="landing-img" src="images/landing2.png" />
                    </Col>
                </Row>
                <Row gutter={[40, 8]} justify="center" className="features text-center">
                    <Col span={3}>
                        <Avatar size={45} icon={<DynamicIcon type={'AppstoreAddOutlined'} />} className="ant-btn-primary hivelvet-btn"/>
                        <p>Personal Rooms</p>
                    </Col>
                    <Col span={3}>
                        <Avatar size={45} icon={<DynamicIcon type={'BgColorsOutlined'} />} className="ant-btn-primary hivelvet-btn"/>
                        <p>Full Branding</p>
                    </Col>
                    <Col span={3}>
                        <Avatar size={45} icon={<DynamicIcon type={'PlayCircleOutlined'} />} className="ant-btn-primary hivelvet-btn"/>
                        <p>Recordings management</p>
                    </Col>
                    <Col span={3}>
                        <Avatar size={45} icon={<DynamicIcon type={'ControlOutlined'} />} className="ant-btn-primary hivelvet-btn"/>
                        <p>Flexible Configuration</p>
                    </Col>
                    <Col span={3}>
                        <Avatar size={45} icon={<DynamicIcon type={'ZcaleRight'} iconClassName="zcaleright-icon" />} className="ant-btn-primary hivelvet-btn"/>
                        <p>ZcaleRight <br/>Support</p>
                    </Col>
                </Row>
            </>
        );
    }
}

export default LandingPage;
