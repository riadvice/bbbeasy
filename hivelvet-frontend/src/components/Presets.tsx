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

import React, { ReactPropTypes, useEffect, useState } from 'react';
import Notifications from './Notifications';

import {
    Button,
    Card,
    Row,
    Col,
    Form,
    Input,
    Modal,
    PageHeader,
    Popconfirm,
    Popover,
    Typography,
    Tooltip,
    Switch,
    Upload,
    message,
    InputNumber,
    Space,
} from 'antd';
import { DeleteOutlined, EditOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import ColorPicker from 'rc-color-picker/lib/ColorPicker';

import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';
import LocaleService from '../services/locale.service';
import DynamicIcon from './DynamicIcon';
import presetsService from '../services/presets.service';
import { MyPresetType } from '../types/MyPresetType';
import { SubCategoryType } from '../types/SubCategoryType';
import { UploadOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import axios from 'axios';
import { categoriesIcons } from '../types/CategoriesIcon';
import { getIconName } from '../types/GetIconName';

const { Link, Title } = Typography;
const API_URL = process.env.REACT_APP_API_URL;

interface PresetColProps {
    key: number;
    preset: MyPresetType;
    mypresets: MyPresetType[];
    deleteClickHandler: any;
    editclickHandler: any;
}
type Item = {
    key: number;
    name: string;
};
type formType = {
    name: string;
};
let addForm: FormInstance = null;

const PresetsCol: React.FC<PresetColProps> = ({ key, preset, mypresets, deleteClickHandler, editclickHandler }) => {
    const [file, setFile] = React.useState<UploadFile>(null);
    const [isShown, setIsShown] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = React.useState<string>('');
    const [modalContent, setModalContent] = React.useState<SubCategoryType[]>([]);
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [primaryColor, setPrimaryColor] = React.useState<string>('');
    const [editingKey, setEditingKey] = React.useState<number>(null);
    const [text, setText] = useState<string>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [presetName, setPresetName] = useState<string>(preset['name']);
    const props = {
        beforeUpload: (file) => {
            const isPNG = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';
            if (!isPNG) {
                message.error(`${file.name} is not a img file`);
            }
            return isPNG || Upload.LIST_IGNORE;
        },
        onChange: (info) => {
            setFile(info.fileList[0]);
        },
    };
    const showModal = (title: string, content: SubCategoryType[]) => {
        setIsModalVisible(true);
        setModalTitle(title);
        setModalContent(content);
    };
    const [editForm] = Form.useForm();
    const setModal = (content: any) => {
        setIsModalVisible(false);
        for (let i = 0; i < content.length; i++) {
            if (content[i].type == 'file' && file != undefined) {
                content[i].value = file.name;
                const fdata: FormData = new FormData();
                fdata.append('logo', file.originFileObj, file.originFileObj.name);
                fdata.append('logo_name', file.originFileObj.name);
                axios
                    .post(API_URL + '/save-logo', fdata)
                    .then((response) => {
                        console.log(response);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }

            presetsService.edit_subcategory_preset(content[i], content[i].id);
        }
    };
    const handleSaveEdit = (preset) => {
        preset['name'] = presetName;
        editclickHandler();

        setIsEditing(false);
    };
    const handleDelete = (id, preset) => {
        deleteClickHandler();
    };
    const toggleEdit = () => {
        setIsEditing(true);
    };
    const cancelEdit = () => {
        setIsEditing(false);
        setPresetName(preset['name']);
    };

    return (
        <Col key={key} span={11}>
            <Card
                title={
                    <div
                        className="preset-card-title"
                        onMouseOver={() => setIsShown(true)}
                        onMouseLeave={() => setIsShown(false)}
                    >
                        {!isEditing && (
                            <Space>
                                <span>{preset['name']}</span>

                                {isShown && (
                                    <Button size="small" type="link" icon={<EditOutlined />} onClick={toggleEdit}>
                                        {t('rename')}
                                    </Button>
                                )}
                            </Space>
                        )}
                        {isEditing && (
                            <Space>
                                <Input
                                    value={presetName}
                                    className="input"
                                    onChange={(e) => {
                                        setPresetName(e.target.value);
                                    }}
                                ></Input>

                                <Popconfirm title={t('cancel_edit')} placement="leftTop" onConfirm={() => cancelEdit()}>
                                    <Button size="middle">
                                        <Trans i18nKey="cancel" />
                                    </Button>
                                </Popconfirm>
                                <Button size="middle" type="primary" onClick={() => handleSaveEdit(preset)}>
                                    <Trans i18nKey="save" />
                                </Button>
                            </Space>
                        )}
                    </div>
                }
                extra={
                    <div className="table-actions">
                        <Popconfirm
                            title={t('delete_preset_confirm')}
                            icon={<QuestionCircleOutlined className="red-icon" />}
                            onConfirm={() => handleDelete(preset['id'], preset)}
                        >
                            <Link>
                                <DeleteOutlined /> <Trans i18nKey="delete" />
                            </Link>
                        </Popconfirm>
                    </div>
                }
            >
                {preset.categories.map((item, subIndex) => (
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
                                            className={subItem.enabled == true ? 'text-black' : 'text-grey'}
                                        >
                                            {subItem.name}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        }
                    >
                        <Button
                            onClick={() => showModal(item.name, item.subcategories)}
                            disabled={!item.enabled}
                            type="link"
                            icon={<DynamicIcon type={getIconName(item.name)} className={'PresetIcon'} />}
                        />
                    </Tooltip>
                ))}
                <Modal
                    title={modalTitle}
                    className="presets-modal"
                    centered
                    visible={isModalVisible}
                    onOk={() => setIsModalVisible(false)}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <Button key="submit" type="primary" onClick={() => setModal(modalContent)}>
                            <Trans i18nKey="confirm" />
                        </Button>,
                    ]}
                >
                    <div className="presets-body">
                        {modalContent.map((item) => (
                            <div key={modalTitle + '_' + item.name}>
                                <Form.Item label={item.name} name={item.name}>
                                    {item.type == 'bool' && (
                                        <Switch
                                            disabled={!item.enabled}
                                            defaultChecked={item.value == true ? true : false}
                                            onChange={(checked) => {
                                                item.value = checked;
                                            }}
                                        />
                                    )}

                                    {item.type === 'string' && (
                                        <Input
                                            style={{ 'width': 'fit-content' }}
                                            disabled={!item.enabled}
                                            defaultValue={item.value}
                                            placeholder={item.name}
                                            onChange={(event) => {
                                                item.value = event.target.value;
                                            }}
                                        />
                                    )}

                                    {item.type === 'color' && (
                                        <ColorPicker
                                            animation="slide-up"
                                            defaultColor={item.value}
                                            onClose={(color) => {
                                                item.value = color.color;
                                            }}
                                            placement="bottomLeft"
                                        >
                                            <span className="rc-color-picker-trigger" />
                                        </ColorPicker>
                                    )}
                                    {item.type === 'file' && (
                                        <Upload {...props} multiple={false} name={item.name}>
                                            <Button disabled={!item.enabled} icon={<UploadOutlined />}>
                                                Upload jpg,jpeg,png only
                                            </Button>
                                            {item.value}
                                        </Upload>
                                    )}
                                    {item.type === 'integer' && (
                                        <InputNumber
                                            min={1}
                                            max={100}
                                            disabled={!item.enabled}
                                            defaultValue={item.value}
                                            placeholder={item.name}
                                            onChange={(val) => (item.value = val)}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                        ))}
                    </div>
                </Modal>
            </Card>
        </Col>
    );
};

const Presets = () => {
    const [myPresets, setMyPresets] = useState<MyPresetType[]>([]);
    const [myPresetsNames, setMyPresetsNames] = React.useState<Item[]>([]);
    const [errorsAdd, setErrorsAdd] = useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);

    useEffect(() => {
        presetsService
            .collect_my_presets()
            .then((response1) => {
                console.log('presets', response1);
                setMyPresetsNames(response1.data);
                const arr: MyPresetType[] = [];
                for (let i = 0; i < response1.data.length; i++) {
                    arr.push(response1.data[i]);
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
        presetsService
            .add_preset(formValues)
            .then((response) => {
                setLoading(true);
                setIsModalVisible(false);
                const newRowData: MyPresetType = response.data.preset;
                Notifications.openNotificationWithIcon('success', t('add_preset_success'));
                //delete data of form
                addForm?.resetFields();
                //add data to table
                setLoading(false);

                presetsService.collect_my_presets().then((response) => {
                    setMyPresets(response.data);
                });
            })
            .catch((error) => {
                console.log(error);
            });
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
    const deletePreset = (id) => {
        presetsService
            .delete_preset(id)
            .then((response) => {
                console.log(response);
                setLoading(true);

                const pre = myPresets.filter((p) => p.id != id);
                setMyPresets(pre);
                Notifications.openNotificationWithIcon('success', t('delete_preset_success'));
            })
            .catch((error) => {
                console.log(error);
            });
    };
    const editPreset = (preset) => {
        presetsService
            .edit_preset(preset, preset.id)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });
        const pre = myPresets.filter((p) => p.id == preset.id);

        setMyPresets(myPresets);
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
                        <Input placeholder={t('name.label')} className="input-add" />
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
                    <PresetsCol
                        key={index}
                        preset={singlePresets}
                        mypresets={myPresets}
                        deleteClickHandler={deletePreset.bind(this, singlePresets.id)}
                        editclickHandler={editPreset.bind(this, singlePresets)}
                    />
                ))}
            </Row>
        </>
    );
};

export default withTranslation()(Presets);
