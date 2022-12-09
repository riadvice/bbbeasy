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

import React, { useEffect } from 'react';
import { CustomTagProps } from 'rc-select/lib/BaseSelect';
import { Button, Col, Form, Input, Modal, Popconfirm, Row, Select, Tag } from 'antd';
import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';

import { UserType } from 'types/UserType';
import authService from 'services/auth.service';
import presetsService from 'services/presets.service';
import { MyPresetType } from 'types/MyPresetType';
import labelsService from 'services/labels.service';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/es/form/Form';
import { LabelType } from 'types/LabelType';
import { PresetType } from 'types/PresetType';
import roomsService from 'services/rooms.service';
import Notifications from './Notifications';
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
    defaultColor: string;
    isModalShow: boolean;
    close: any;
    shortlink: string;

    initialAddValues: formType;
};
type Item = {
    key: number;
    name: string;
    description: string;
    color: string;
};
export const AddRoomForm = (props: Props) => {
    const { isModalShow, shortlink } = props;

    const [loading, setLoading] = React.useState<boolean>(false);
    const [errorsAdd, setErrorsAdd] = React.useState<string[]>([]);

    const [readOnly, setReadOnly] = React.useState<boolean>(true);
    const [shortLink, setShortLink] = React.useState<string>('');

    const handleAdd = (values) => {
        const formValues: formType = values;

        setErrorsAdd([]);
        setLoading(true);
        roomsService
            .add_room(formValues)
            .then((response) => {
                console.log(response);
                Notifications.openNotificationWithIcon('success', t('add_room_success'));
                props.close();
                setShortLink('');

                addForm?.resetFields();
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

    const cancelAdd = () => {
        props.close();
        setShortLink('');
        addForm?.resetFields();
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
    const cancelEdit = () => {
        setReadOnly(true);
    };
    const handleSaveEdit = async () => {
        setReadOnly(true);

        setShortLink(addForm.getFieldValue('shortlink'));
    };

    const [data, setData] = React.useState<Item[]>([]);
    const labels_data = [];
    data.forEach((label) => {
        const newlabel = { label: label.name, value: label.color };
        labels_data.push(newlabel);
    });

    const tagRender = (props: CustomTagProps) => {
        const { label, value, closable, onClose } = props;
        const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
            event.preventDefault();
            event.stopPropagation();
        };
        return (
            <Tag
                color={value}
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3 }}
            >
                {label}
            </Tag>
        );
    };

    const [currentUser, setCurrentUser] = React.useState<UserType>(null);
    const [myPresets, setMyPresets] = React.useState<MyPresetType[]>([]);
    const [cancelVisibility, setCancelVisibility] = React.useState<boolean>(true);
    useEffect(() => {
        const user: UserType = authService.getCurrentUser();

        setCurrentUser(user);
        presetsService
            .collect_my_presets(user.id)
            .then((response) => {
                setMyPresets(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
        labelsService
            .list_labels()
            .then((response) => {
                if (response.data) {
                    setData(response.data);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const { Option } = Select;

    const handleChange = (event) => {
        addForm.setFieldValue('shortlink', event.target.value);

        setShortLink(event.target.value);
    };

    return (
        <>
            <Modal
                title={<Trans i18nKey="new_room" />}
                className="add-modal"
                centered
                visible={props.isModalShow}
                onOk={handleAdd}
                onCancel={props.close}
                footer={null}
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
                                        message: <Trans i18nKey="room_name.size" />,
                                    },
                                ]}
                            >
                                <Input placeholder={t('name.label')} defaultValue={'ha'} />
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
                                    onFocus={() => setCancelVisibility(false)}
                                >
                                    {myPresets.map((item) => (
                                        <Option key={item.id} value={item.id} className="text-capitalize">
                                            {item.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={11} offset={2}>
                            {readOnly ? (
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
                                    <Input.Group compact>
                                        <Input
                                            style={{ width: '235px', backgroundColor: '#dddfe1' }}
                                            readOnly={readOnly}
                                            value={shortLink != '' ? shortLink : shortlink}
                                        />
                                        <Button
                                            icon={<EditOutlined />}
                                            style={{ backgroundColor: '#c6c6c6' }}
                                            onClick={toggleEdit}
                                        >
                                            {' '}
                                        </Button>
                                    </Input.Group>
                                </Form.Item>
                            ) : (
                                <Form.Item
                                    name="shortlink"
                                    label={<Trans i18nKey="shortlink.label" />}
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
                                    <Input
                                        onChange={handleChange}
                                        readOnly={readOnly}
                                        defaultValue={shortLink != '' ? shortLink : shortlink}
                                        onPressEnter={handleSaveEdit}
                                        suffix={
                                            <>
                                                <Popconfirm
                                                    title={t('cancel_edit')}
                                                    placement="leftTop"
                                                    onConfirm={() => cancelEdit()}
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
                                </Form.Item>
                            )}
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
                                rules={[
                                    {
                                        required: true,
                                        message: <Trans i18nKey="labels_required" />,
                                    },
                                ]}
                            >
                                <Select
                                    mode="multiple"
                                    showArrow
                                    tagRender={tagRender}
                                    style={{ width: '100%' }}
                                    options={labels_data}
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
        </>
    );
};
export default withTranslation()(AddRoomForm);
