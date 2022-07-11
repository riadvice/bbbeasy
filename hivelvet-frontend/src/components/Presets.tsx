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

import React, { useEffect, useState } from 'react';

import { Button, Card, Row, Col, Form, Input, Modal, PageHeader, Popconfirm, Popover, Typography, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';

import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';
import LocaleService from '../services/locale.service';
import { PresetType } from '../types/PresetType';
import InstallService from '../services/install.service';
import DynamicIcon from './DynamicIcon';

const { Link, Title } = Typography;

interface PresetColProps {
    key: number;
    presets: PresetType[];
}
type formType = {
    name: string;
};
let addForm: FormInstance = null;

const PresetsCol: React.FC<PresetColProps> = ({ key, presets }) => {
    const [isShown, setIsShown] = useState<boolean>(false);
    return (
        <Col key={key} span={11}>
            <Card
                title={
                    <div
                        className="preset-card-title"
                        onMouseOver={() => setIsShown(true)}
                        onMouseLeave={() => setIsShown(false)}
                    >
                        <span>One to one</span>
                        {isShown && (
                            <Button size="small" type="link" icon={<EditOutlined />}>
                                {t('rename')}
                            </Button>
                        )}
                    </div>
                }
                extra={
                    <div className="table-actions">
                        <Popconfirm
                            title={t('delete_preset_confirm')}
                            icon={<QuestionCircleOutlined className="red-icon" />}
                        >
                            <Link>
                                <DeleteOutlined /> <Trans i18nKey="delete" />
                            </Link>
                        </Popconfirm>
                    </div>
                }
            >
                {presets.map((item, subIndex) => (
                    <Tooltip
                        key={subIndex + '-' + item.name}
                        placement={LocaleService.direction == 'rtl' ? 'leftTop' : 'rightTop'}
                        overlayClassName="install-tooltip"
                        title={
                            <>
                                <Title level={5}>{item.name}</Title>
                                <ul>
                                    {item.subcategories.map((subItem) => (
                                        <li
                                            key={item.name + '_' + subItem.name}
                                            className={subItem.status == true ? 'text-black' : 'text-grey'}
                                        >
                                            {subItem.name}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        }
                    >
                        <Button type="link" icon={<DynamicIcon type={item.icon} className="PresetIcon" />} />
                    </Tooltip>
                ))}
            </Card>
        </Col>
    );
};

const Presets = () => {
    const [myPresets, setMyPresets] = useState<PresetType[][]>([]);

    const [errorsAdd, setErrorsAdd] = useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    useEffect(() => {
        InstallService.collect_presets()
            .then((response) => {
                const arr: PresetType[][] = [];
                for (let i = 0; i < 3; i++) {
                    arr.push(response.data);
                    console.log(arr);
                }
                setMyPresets(arr);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    //add
    const handleAdd = (values) => {
        const formValues: formType = values;
        setErrorsAdd([]);
        console.log(formValues);
    };
    const failedAdd = () => {
        setErrorsAdd([]);
    };
    const cancelAdd = () => {
        setIsModalVisible(false);
    };
    const toggleAdd = () => {
        addForm?.resetFields();
        setErrorsAdd([]);
        setIsModalVisible(true);
    };

    return (
        <>
            <PageHeader
                className="site-page-header presets-header"
                title={<Trans i18nKey="presets" />}
                subTitle={
                    <Input
                        className="search-input"
                        size="middle"
                        placeholder={t('search_preset')}
                        allowClear
                        suffix={<SearchOutlined />}
                    />
                }
                extra={[
                    <Popover
                        key="2"
                        content={'content info'}
                        trigger="click"
                        placement={LocaleService.direction == 'rtl' ? 'right' : 'left'}
                    >
                        <QuestionCircleOutlined className="help-icon" />
                    </Popover>,
                    <Button key="1" type="primary" onClick={toggleAdd}>
                        <Trans i18nKey="new_preset" />
                    </Button>,
                ]}
            />

            <Modal
                title={<Trans i18nKey="new_preset" />}
                className="add-modal"
                centered
                visible={isModalVisible}
                onOk={handleAdd}
                onCancel={cancelAdd}
                footer={null}
            >
                <Form
                    layout="vertical"
                    ref={(form) => (addForm = form)}
                    initialValues={{ name: '' }}
                    hideRequiredMark
                    onFinish={handleAdd}
                    onFinishFailed={failedAdd}
                    validateTrigger="onSubmit"
                >
                    <Form.Item
                        label={<Trans i18nKey="name.label" />}
                        name="name"
                        {...('name' in errorsAdd && {
                            help: (
                                <Trans
                                    i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsAdd['name'])}
                                />
                            ),
                            validateStatus: 'error',
                        })}
                        rules={[
                            {
                                required: true,
                                message: <Trans i18nKey="name.required" />,
                            },
                        ]}
                    >
                        <Input placeholder={t('name.label')} />
                    </Form.Item>
                    <Form.Item className="modal-submit-btn button-container">
                        <Button type="text" className="cancel-btn prev" block onClick={cancelAdd}>
                            <Trans i18nKey="cancel" />
                        </Button>
                        <Button type="primary" htmlType="submit" block>
                            <Trans i18nKey="create" />
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Row gutter={[32, 32]} justify="center" className="presets-cards">
                {myPresets.map((singlePresets, index) => (
                    <PresetsCol key={index} presets={singlePresets} />
                ))}
            </Row>
        </>
    );
};

export default withTranslation()(Presets);
