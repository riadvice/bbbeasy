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
import { Trans, withTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

type Props = {
    isLogged: boolean;
    user: any;
};

type State = {};

class Home extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <Paragraph className="text-center home-guide">
                <Title level={3} underline>
                    <Trans i18nKey="create-easy-room" />
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
                            <Trans i18nKey="give-it-name" />
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
                            <Trans i18nKey="assign-preset" />
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
                            <Trans i18nKey="mark-labels" />
                        </Title>
                    </Col>
                </Row>
                <Button type="primary">
                    <Trans i18nKey="create-first-room" />
                </Button>
            </Paragraph>
        );
    }
}

export default withTranslation()(Home);
