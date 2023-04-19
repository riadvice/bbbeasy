/**
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBEasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import { Trans } from 'react-i18next';
import { t } from 'i18next';

import { Button, Card, Col, Dropdown, Input, Row, Space, Typography } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    MoreOutlined,
    SearchOutlined,
    ShareAltOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import DynamicIcon from './DynamicIcon';
import LoadingSpinner from './LoadingSpinner';
import EmptyData from './EmptyData';

import LocaleService from '../services/locale.service';

import { RecordingType } from '../types/RecordingType';
import { MenuProps } from 'antd/lib/menu';

const { Title } = Typography;

type Props = {
    loading: boolean;
    roomRecordings: RecordingType[];
};

const RoomRecordings = (props: Props) => {
    const { loading, roomRecordings } = props;
    const actionsItems: MenuProps['items'] = [
        {
            key: '1',
            label: <Trans i18nKey="rename" />,
        },
        {
            key: '2',
            label: <Trans i18nKey="publish" />,
        },
        {
            type: 'divider',
        },
        {
            key: '3',
            danger: true,
            label: <Trans i18nKey="delete" />,
        },
    ];

    return (
        <div className="room-recordings">
            <div className="mb-40">
                <Space size="middle">
                    <Title level={4}>
                        <Trans i18nKey="room_recordings" />
                    </Title>
                    {roomRecordings.length != 0 && (
                        <Input
                            className="search-input"
                            size="middle"
                            placeholder={t('search')}
                            allowClear
                            suffix={<SearchOutlined />}
                            bordered={false}
                        />
                    )}
                </Space>
            </div>
            {loading ? (
                <LoadingSpinner className="mt-30 content-center" />
            ) : roomRecordings.length != 0 ? (
                <Row gutter={[16, 20]} className="room-recordings-body">
                    {roomRecordings.map((recording) => {
                        const addHeight = recording.name.length <= 16 ? '65px' : null;
                        const recordingName =
                            recording.name.length <= 24 ? recording.name : recording.name.substring(0, 21) + '...';

                        return (
                            <Col span={6} key={recording.key}>
                                <Card
                                    bordered={false}
                                    hoverable
                                    cover={
                                        <div className="recording-box">
                                            <img src="/images/meeting.png" width={281} height={220} />
                                            <div className="recording-cover">
                                                <div className="recording-header">
                                                    <Title level={3} style={{ height: addHeight }}>
                                                        {recordingName}
                                                    </Title>
                                                    <Dropdown
                                                        key="more"
                                                        menu={{ items: actionsItems }}
                                                        placement={
                                                            LocaleService.direction == 'rtl'
                                                                ? 'bottomLeft'
                                                                : 'bottomRight'
                                                        }
                                                    >
                                                        <MoreOutlined />
                                                    </Dropdown>
                                                </div>

                                                <Space direction="vertical" className="recording-infos">
                                                    <span>
                                                        <TeamOutlined /> {recording.users} <Trans i18nKey="attendees" />{' '}
                                                    </span>
                                                    <span>
                                                        <CalendarOutlined /> {recording.date}
                                                    </span>
                                                    <span>
                                                        <ClockCircleOutlined /> {recording.duration}
                                                    </span>
                                                </Space>

                                                <Button
                                                    className="share-icon"
                                                    size="middle"
                                                    type="primary"
                                                    shape="circle"
                                                    icon={<ShareAltOutlined />}
                                                />
                                            </div>
                                        </div>
                                    }
                                >
                                    <Space direction="vertical" size="large">
                                        <div>
                                            <Button
                                                size="middle"
                                                type="primary"
                                                icon={
                                                    <DynamicIcon type="playback-presentation" className="bbbeasy-ppt" />
                                                }
                                            >
                                                <span>
                                                    <Trans i18nKey="replay" />
                                                </span>
                                            </Button>
                                            <span className="file-size">
                                                35,6 <Trans i18nKey="mb" />
                                            </span>
                                        </div>
                                        <Space size="large" className="actions">
                                            <div>
                                                <Button
                                                    type="primary"
                                                    ghost
                                                    icon={<DynamicIcon type="playback-podcast" />}
                                                />
                                                <span className="file-size">
                                                    35,6 <Trans i18nKey="mb" />
                                                </span>
                                            </div>
                                            <div>
                                                <Button
                                                    type="primary"
                                                    ghost
                                                    icon={<DynamicIcon type="DesktopOutlined" />}
                                                />
                                                <span className="file-size">
                                                    35,6 <Trans i18nKey="mb" />
                                                </span>
                                            </div>
                                            <div>
                                                <Button
                                                    type="primary"
                                                    ghost
                                                    icon={<DynamicIcon type="mp4" className="bbbeasy-mp4" />}
                                                />
                                                <span className="file-size">
                                                    35,6 <Trans i18nKey="mb" />
                                                </span>
                                            </div>
                                            <div>
                                                <Button
                                                    type="primary"
                                                    ghost
                                                    icon={<DynamicIcon type="activity-reports" />}
                                                />
                                                <span className="file-size">
                                                    35,6 <Trans i18nKey="mb" />
                                                </span>
                                            </div>
                                        </Space>
                                    </Space>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <EmptyData description={<Trans i18nKey="no_recordings" />} />
            )}
        </div>
    );
};

export default RoomRecordings;
