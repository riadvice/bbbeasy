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

import { Button, Form, Typography, Card, Modal, Switch, Alert, Tooltip } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import DynamicIcon from './DynamicIcon';
import { T } from '@transifex/react';
const { Title, Paragraph } = Typography;
const { Grid, Meta } = Card;

type SubCategoryType = {
    name: string;
    status: boolean;
};

type PresetType = {
    name: string;
    icon: string;
    subcategories: SubCategoryType[];
};

type Props = {
    presets: PresetType[];
};

export const Step3Form = (props: Props) => {
    const { presets } = props;

    const [modalTitle, setModalTitle] = React.useState('');
    const [modalContent, setModalContent] = React.useState<SubCategoryType[]>([]);
    const [isModalVisible, setIsModalVisible] = React.useState(false);

    const showModal = (title, content) => {
        setIsModalVisible(true);
        setModalTitle(title);
        setModalContent(content);
    };

    return (
        <>
            <Paragraph className="final-form-header">
                <Title level={4} className="final-form-header">
                    <T _str="BigBlueButton rooms settings" />
                </Title>

                <Alert
                    className="settings-info"
                    type="info"
                    message={<T _str="Click on each button to customise the configuration group and hover it to get its summary." />}
                    closeText={<T _str="I understand, thank you!" />}
                />
            </Paragraph>
            <Card bordered={false}>
                {presets.map((item) => (
                    <Tooltip
                        key={item.name}
                        placement="rightTop"
                        overlayClassName="install-tooltip"
                        title={
                            <ul>
                                {item.subcategories.map((subItem) => (
                                    <li
                                        key={subItem.name}
                                        className={subItem.status == true ? 'text-black' : 'text-grey'}
                                    >
                                        <T _str={subItem.name} />
                                    </li>
                                ))}
                            </ul>
                        }
                    >
                        <Grid
                            key={item.name}
                            className="presets-grid"
                            onClick={() => showModal(item.name, item.subcategories)}
                        >
                            <Meta
                                avatar={<DynamicIcon type={item.icon} className="PresetIcon" />}
                                title={<T _str={item.name} />}
                            />
                        </Grid>
                    </Tooltip>
                ))}

                <Modal
                    title={<T _str={modalTitle} />}
                    className="presets-modal"
                    centered
                    visible={isModalVisible}
                    onOk={() => setIsModalVisible(false)}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <Button key="submit" type="primary" onClick={() => setIsModalVisible(false)}>
                            <T _str="Confirm" />
                        </Button>
                    ]}
                >
                    <div className="presets-body">
                        {modalContent.map((item,index) => (
                            <div key={index}>
                                <Form.Item label={<T _str={item.name} />}>
                                    <Switch
                                        checkedChildren={<CheckOutlined />}
                                        unCheckedChildren={<CloseOutlined />}
                                        defaultChecked={item.status == true ? true : false}
                                        onChange={(checked) => { item.status = checked }}
                                    />
                                </Form.Item>
                            </div>
                        ))}
                    </div>
                </Modal>
            </Card>
        </>
    );
};