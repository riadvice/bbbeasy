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
import { Col, Row, Typography } from 'antd';
import { T } from '@transifex/react';

const { Title, Text, Paragraph } = Typography;

class LandingPage extends Component<any, any> {
    render() {
        return (
            <Row className="container hero">
                <Col>
                    <Paragraph className="hero-copy">
                        <Title>
                            <T _str="Welcome to Hivelvet Application" />
                        </Title>
                        <Text style={{ color: '#3D6D9D', fontSize: 20, marginBottom: 24 }}>
                            <T _str="The new rooms experience for BigBlueButton" />.<br></br>
                            <T _str="New Open-source and simple portal for Web conference BBB" />
                            <br></br>
                            <br></br>
                        </Text>
                        <Paragraph className="hero-cta" style={{ marginTop: 24 }}>
                            <Link className={'button button-primary'} to={'/login'}>
                                {' '}
                                <T _str="Sign in" />{' '}
                            </Link>
                            <Link className={'button'} to={'/register'}>
                                {' '}
                                <T _str="Sign up" />{' '}
                            </Link>
                        </Paragraph>
                    </Paragraph>
                </Col>
                <Col>
                    <Paragraph className="hero-figure anime-element">
                        <svg className="placeholder" width="528" height="396" viewBox="0 0 528 396">
                            <rect width="528" height="396" className="home-transparent"/>
                        </svg>
                        <Paragraph className="hero-figure-box hero-figure-box-01" data-rotation="45deg"></Paragraph>
                        <Paragraph className="hero-figure-box hero-figure-box-02" data-rotation="-45deg"></Paragraph>
                        <Paragraph className="hero-figure-box hero-figure-box-04" data-rotation="-135deg"></Paragraph>
                        <Paragraph className="hero-figure-box hero-figure-box-05"></Paragraph>
                        <Paragraph className="hero-figure-box hero-figure-box-06"></Paragraph>
                        <Paragraph className="hero-figure-box hero-figure-box-07"></Paragraph>
                        <Paragraph className="hero-figure-box hero-figure-box-08" data-rotation="-22deg"></Paragraph>
                        <Paragraph className="hero-figure-box hero-figure-box-09" data-rotation="-52deg"></Paragraph>
                        <Paragraph className="hero-figure-box hero-figure-box-10" data-rotation="-50deg"></Paragraph>
                    </Paragraph>
                </Col>
            </Row>
        );
    }
}

export default LandingPage;
