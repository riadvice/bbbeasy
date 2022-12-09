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
import { Row, Col, Avatar, Typography, Button } from 'antd';
import { Trans, withTranslation } from 'react-i18next';
import AddRoomForm from './AddRoomForm';

import { PresetType } from 'types/PresetType';
import { LabelType } from 'types/LabelType';

import { getRandomString } from 'types/getRandomString';

const { Title, Paragraph } = Typography;

type formType = {
    name?: string;
    shortlink?: string;
    preset?: PresetType;
    labels?: LabelType[];
};

const Home = () => {
    const initialAddValues: formType = {
        name: '',
        shortlink: getRandomString(),
        preset: null,
        labels: [],
    };

    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);

    return (
        <>
            <Paragraph className="text-center home-guide">
                <Title level={2}>
                    <Trans i18nKey="create-easy-room" />
                </Title>
                <Row justify="center">
                    <Col span={5}>
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
                    <Col span={5}>
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
                    <Col span={5}>
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
                <Button type="primary" onClick={() => setIsModalVisible(true)}>
                    <Trans i18nKey="create-first-room" />
                </Button>
                <AddRoomForm
                    defaultColor="#fbbc0b"
                    isModalShow={isModalVisible}
                    close={() => {
                        setIsModalVisible(false);
                    }}
                    shortlink={'/hv/' + initialAddValues.shortlink}
                    initialAddValues={initialAddValues}
                />
            </Paragraph>
        </>
    );
};

export default withTranslation()(Home);
