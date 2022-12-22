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

import React, { useState } from 'react';

import { FormInstance } from 'antd/lib/form';
import { withTranslation } from 'react-i18next';

import { RoomType } from 'types/RoomType';
import { Badge, Card, Col, Row, Space } from 'antd';

import { DataContext } from 'lib/RoomsContext';
import authService from 'services/auth.service';
import Home from './Home';

type formType = {
    name?: string;
    description?: string;
    color?: string;
};
interface RoomsColProps {
    key: number;
    room: RoomType;
}
const addForm: FormInstance = null;
const RoomsCol: React.FC<RoomsColProps> = ({ key, room }) => {
    const [isShown, setIsShown] = useState<boolean>(false);

    const labels = [];
    room.labels.map((item) => {
        labels.push(item);
    });

    return (
        <Col key={key} span={4}>
            <Card
                title={
                    <>
                        <div
                            className="room-card-title"
                            onMouseOver={() => setIsShown(true)}
                            onMouseLeave={() => setIsShown(false)}
                        >
                            <Space>
                                <div
                                    style={{
                                        backgroundColor: '#fbbc0b',
                                    }}
                                    className="profil-btn"
                                >
                                    <span style={{ fontWeight: 'bolder', color: 'white' }}>
                                        {' '}
                                        {room.name.slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <br />
                            </Space>
                        </div>

                        <h4 style={{ 'display': 'flex', 'marginLeft': '20%' }}>{room.name}</h4>
                    </>
                }
            >
                <div className="room-card-body">
                    {room.labels.map((item) => {
                        return (
                            <Badge
                                key={item.id}
                                count={item.name}
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />
                        );
                    })}
                </div>
            </Card>
        </Col>
    );
};

const Rooms = () => {
    const dataContext = React.useContext(DataContext);

    if (dataContext.dataRooms.length == 0) {
        return <Home />;
    } else {
        return (
            <>
                <Row gutter={10} className="rooms-cards">
                    {dataContext.dataRooms.map((singleRoom) => (
                        <RoomsCol key={singleRoom.id} room={singleRoom} />
                    ))}
                </Row>
            </>
        );
    }
};

export default withTranslation()(Rooms);
