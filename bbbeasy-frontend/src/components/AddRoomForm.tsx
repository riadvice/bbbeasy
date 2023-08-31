/**
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';

import { Button, Col, Form, Input, Modal, Popconfirm, Row, Select, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';

import Notifications from './Notifications';
import { DataContext } from 'lib/RoomsContext';
import { CustomTagProps } from 'rc-select/lib/BaseSelect';

import RoomsService from 'services/rooms.service';
import AuthService from 'services/auth.service';

import { FormInstance } from 'antd/es/form/Form';
import { LabelType } from 'types/LabelType';
import { PresetType } from 'types/PresetType';
import { UserType } from 'types/UserType';
import NoData from './NoData';
import PresetsService from '../services/presets.service';

type formType = {
    name?: string;
    shortlink?: string;
    preset?: PresetType;
    labels?: LabelType[];
};
let addForm: FormInstance = null;

type Props = {
    isLogin?: boolean;
    errors?: string[];

    isModalShow: boolean;
    close: () => void;
    shortlink: string;
    presets?: PresetType[];

    initialAddValues: formType;
};

export const AddRoomForm = (props: Props) => {
    const { shortlink } = props;

    const [loading, setLoading] = React.useState<boolean>(false);
    const [errorsAdd, setErrorsAdd] = React.useState<string[]>([]);
    const [presets, setPresets] = React.useState<PresetType[]>([]);
    const [readOnly, setReadOnly] = React.useState<boolean>(true);
    const [shortLink, setShortLink] = React.useState<string>('');
    const dataContext = React.useContext(DataContext);

    const currentUser: UserType = AuthService.getCurrentUser();
    useEffect(() => {
        setReadOnly(true);
    }, [props.close]);

    useEffect(() => {
        PresetsService.list_presets(currentUser.id)
            .then((result) => {
                setPresets(result.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [props.presets]);

    const prefixShortLink = '/r/';

    const handleAdd = (values) => {
        const formValues: formType = values;
        setErrorsAdd([]);
        setLoading(true);
        RoomsService.add_room(formValues, AuthService.getCurrentUser().id)
            .then((response) => {
                Notifications.openNotificationWithIcon('success', t('add_room_success'));

                dataContext.setDataRooms([...dataContext.dataRooms, response.data.room]);
                setShortLink('');

                addForm?.resetFields();
                props.close();
            })
            .catch((error) => {
                const responseData = error.response.data;

                setErrorsAdd(responseData.errors);

                if (responseData.errors) {
                    setErrorsAdd(responseData.errors);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };
    const failedAdd = () => {
        setShortLink('');
        setErrorsAdd([]);
    };
    const cancelEdit = () => {
        setShortLink(shortlink);
        setReadOnly(true);
    };
    const cancelAdd = () => {
        setShortLink('');
        addForm?.resetFields();
        setReadOnly(false);
        props.close();
    };
    const toggleEdit = () => {
        setReadOnly(false);

        if (shortLink == '') {
            setShortLink(shortlink);
            addForm.setFieldValue('shortlink', shortlink);
        } else {
            addForm.setFieldValue('shortlink', shortLink);
        }
    };

    const handleSaveEdit = async () => {
        setReadOnly(true);

        setShortLink(addForm.getFieldValue('shortlink'));
    };

    const labels_data = [];
    dataContext.dataLabels.forEach((label) => {
        const newLabel = { label: label.name, value: label.color };
        labels_data.push(newLabel);
    });

    const tagRender = (props: CustomTagProps) => {
        const { label, value, closable, onClose } = props;
        const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
            event.preventDefault();
            event.stopPropagation();
        };
        return (
            <Tag color={value} onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose}>
                {label}
            </Tag>
        );
    };

    const { Option } = Select;

    const handleChange = (event) => {
        addForm.setFieldValue('shortlink', event.target.value);
        setShortLink(event.target.value);
    };

    return (
        <>
            {props.isModalShow ? (
                <Modal
                    title={<Trans i18nKey="new_room" />}
                    className="add-modal large-modal"
                    centered
                    open={props.isModalShow}
                    onOk={handleAdd}
                    onCancel={cancelAdd}
                    footer={null}
                    maskClosable={true}
                >
                    <Form
                        layout="vertical"
                        ref={(form) => (addForm = form)}
                        initialValues={props.initialAddValues}
                        hideRequiredMark
                        onFinish={handleAdd}
                        onFinishFailed={failedAdd}
                        validateTrigger="onSubmit"
                    >
                        <Row justify="center">
                            <Col span={11}>
                                <Form.Item
                                    label={<Trans i18nKey="name.label" />}
                                    name="name"
                                    {...('name' in errorsAdd && {
                                        help: (
                                            <Trans
                                                i18nKey={Object.keys(EN_US).filter(
                                                    (elem) => EN_US[elem] == errorsAdd['name']
                                                )}
                                            />
                                        ),
                                        validateStatus: 'error',
                                    })}
                                    rules={[
                                        {
                                            required: true,
                                            message: <Trans i18nKey="name.required" />,
                                        },
                                        {
                                            min: 4,
                                            message: <Trans i18nKey="room_name.minSize" />,
                                        },
                                        {
                                            max: 256,
                                            message: <Trans i18nKey="room_name.maxSize" />,
                                        },
                                    ]}
                                >
                                    <Input placeholder={t('name.label')} />
                                </Form.Item>

                                <Form.Item
                                    label={<Trans i18nKey="preset.label" />}
                                    name="preset"
                                    rules={[
                                        {
                                            required: true,
                                            message: <Trans i18nKey="preset.required" />,
                                        },
                                    ]}
                                >
                                    <Select
                                        className="select-field"
                                        showSearch
                                        allowClear
                                        placeholder={t('preset.label')}
                                        filterOption={(input, option) =>
                                            option.children
                                                .toString()
                                                .toLowerCase()
                                                .indexOf(input.toString().toLowerCase()) >= 0
                                        }
                                        filterSort={(optionA, optionB) =>
                                            optionA.children
                                                .toString()
                                                .toLowerCase()
                                                .localeCompare(optionB.children.toString().toLowerCase())
                                        }
                                    >
                                        {presets != null &&
                                            presets.map((item) => (
                                                <Option key={item.id} value={item.id} className="text-capitalize">
                                                    {item.name}
                                                </Option>
                                            ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={11} offset={2}>
                                <Form.Item
                                    label={<Trans i18nKey="shortlink.label" />}
                                    name="shortlink"
                                    {...('short_link' in errorsAdd && {
                                        help: (
                                            <Trans
                                                i18nKey={Object.keys(EN_US).filter(
                                                    (elem) => EN_US[elem] == errorsAdd['short_link']
                                                )}
                                            />
                                        ),
                                        validateStatus: 'error',
                                    })}
                                    rules={[
                                        {
                                            required: true,
                                            message: <Trans i18nKey="shortlink.required" />,
                                        },
                                    ]}
                                >
                                    {readOnly ? (
                                        <Input.Group compact className="readonly-item">
                                            <Input
                                                disabled={true}
                                                readOnly={readOnly}
                                                defaultValue={
                                                    prefixShortLink + (shortLink != '' ? shortLink : shortlink)
                                                }
                                            />
                                            <Button icon={<EditOutlined />} onClick={toggleEdit} />
                                        </Input.Group>
                                    ) : (
                                        <Input
                                            addonBefore={prefixShortLink}
                                            onChange={handleChange}
                                            readOnly={readOnly}
                                            defaultValue={prefixShortLink + (shortLink != '' ? shortLink : shortlink)}
                                            onPressEnter={handleSaveEdit}
                                            suffix={
                                                <>
                                                    <Popconfirm
                                                        title={t('cancel_edit')}
                                                        placement="leftTop"
                                                        onConfirm={cancelEdit}
                                                    >
                                                        <Button
                                                            icon={<CloseOutlined />}
                                                            size="small"
                                                            onClick={cancelEdit}
                                                            className="cell-input-cancel"
                                                        />
                                                    </Popconfirm>
                                                    <Button
                                                        icon={<CheckOutlined />}
                                                        size="small"
                                                        onClick={handleSaveEdit}
                                                        type="primary"
                                                    />
                                                </>
                                            }
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    {...('labels' in errorsAdd && {
                                        help: (
                                            <Trans
                                                i18nKey={Object.keys(EN_US).filter(
                                                    (elem) => EN_US[elem] == errorsAdd['labels']
                                                )}
                                            />
                                        ),
                                        validateStatus: 'error',
                                    })}
                                    name="labels"
                                    label={<Trans i18nKey="labels" />}
                                >
                                    <Select
                                        mode="multiple"
                                        showArrow
                                        tagRender={tagRender}
                                        style={{ width: '100%' }}
                                        options={labels_data}
                                        notFoundContent={
                                            <NoData
                                                description={<Trans i18nKey="no_labels" />}
                                                className="empty-labels"
                                            />
                                        }
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item className="modal-submit-btn button-container">
                            <Button type="text" className="cancel-btn prev" block onClick={cancelAdd}>
                                <Trans i18nKey="cancel" />
                            </Button>
                            <Button type="primary" htmlType="submit" disabled={loading} block>
                                <Trans i18nKey="create" />
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            ) : null}
        </>
    );
};
export default withTranslation()(AddRoomForm);
