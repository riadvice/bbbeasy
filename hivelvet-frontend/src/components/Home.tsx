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
import { Row, Col, Avatar, Typography, Button } from 'antd';
import { T } from '@transifex/react';

const { Title, Paragraph } = Typography;

type Props = {
    isLogged: boolean;
    user: any;
};

type State = {};

class Home extends Component<Props, State> {
    username = '';
    constructor(props: Props) {
        super(props);
    }

    render() {
        this.username = this.props.user != null ? this.props.user.username : '';

        return (
            <Paragraph className="text-center home-guide">
                <Title level={3} underline>
                    <T _str="How easy is it to create a room ?" />
                </Title>
                <Row justify="center">
                    <Col span={3}>
                        <Avatar
                            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 85, xxl: 100 }}
                            className="ant-btn-primary hivelvet-btn"
                        >
                            1
                        </Avatar>
                        <Title level={4}>
                            <T _str="Give it a name" />
                        </Title>
                    </Col>
                    <Col span={3}>
                        <Avatar
                            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 85, xxl: 100 }}
                            className="ant-btn-primary hivelvet-btn"
                        >
                            2
                        </Avatar>
                        <Title level={4}>
                            <T _str="Assign it a preset" />
                        </Title>
                    </Col>
                    <Col span={3}>
                        <Avatar
                            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 85, xxl: 100 }}
                            className="ant-btn-primary hivelvet-btn"
                        >
                            3
                        </Avatar>
                        <Title level={4}>
                            <T _str="Mark it with labels" />
                        </Title>
                    </Col>
                </Row>
                <Button type="primary">
                    <T _str="Create my first room" />
                </Button>
            </Paragraph>
        );
    }
}

export default Home;
