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
    Empty,
    Spin,
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import ColorPicker from 'rc-color-picker/lib/ColorPicker';

import { Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';
import LocaleService from '../services/locale.service';
import DynamicIcon from './DynamicIcon';
import PresetsService from '../services/presets.service';
import InstallService from "../services/install.service";
import { MyPresetType } from '../types/MyPresetType';
import { SubCategoryType } from '../types/SubCategoryType';
import { UploadFile } from 'antd/lib/upload/interface';
import { getIconName } from '../types/GetIconName';
import authService from '../services/auth.service';
import { UserType } from '../types/UserType';

const { Link, Title } = Typography;

interface PresetColProps {
    key: number;
    preset: MyPresetType;
    editClickHandler: (newPreset: MyPresetType, oldPreset: MyPresetType) => void;
    deleteClickHandler: () => void;
}
type formType = {
    name: string;
};
let addForm: FormInstance = null;

const PresetsCol: React.FC<PresetColProps> = ({ key, preset, editClickHandler, deleteClickHandler }) => {
    const [file, setFile] = React.useState<UploadFile>(null);
    const [isShown, setIsShown] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = React.useState<string>('');
    const [modalContent, setModalContent] = React.useState<SubCategoryType[]>([]);
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [errorsEdit, setErrorsEdit] = React.useState({});
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
    const getName = (item) => {
        return item.replaceAll('_', ' ').charAt(0).toUpperCase() + item.replaceAll('_', ' ').slice(1);
    };

    //delete
    const handleDelete = () => {
        deleteClickHandler();
    };

    //edit name
    const [editForm] = Form.useForm();
    const toggleEdit = () => {
        setIsEditing(true);
        editForm.setFieldsValue({ name : preset['name'] });
    };
    const cancelEdit = () => {
        setErrorsEdit({});
        setIsEditing(false);
    };
    const handleSaveEdit = async () => {
        setErrorsEdit({});
        try {
            const values = (await editForm.validateFields()) as formType;
            PresetsService.edit_preset(values, preset.id)
                .then((response) => {
                    editClickHandler(response.data.preset, preset);
                    cancelEdit();
                })
                .catch((error) => {
                    const responseData = error.response.data;
                    if (responseData.errors) {
                        setErrorsEdit(responseData.errors);
                    }
                });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    }

    //edit category
    const saveEditPresetCategory = (title: string, preset: MyPresetType, subCategories: SubCategoryType[]) => {
        setIsModalVisible(false);
        if(file != undefined) {
            const formData: FormData = new FormData();
            const sub = subCategories.filter((subCategory) => {
                if(subCategory.type == 'file') {
                    subCategory.value = file.name;
                }
            });
            formData.append('logo', file.originFileObj, file.originFileObj.name);
            formData.append('logo_name', file.originFileObj.name);

            InstallService.save_file(formData)
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        PresetsService.edit_subcategory_preset(title, subCategories, preset.id)
            .then((response) => {
                editClickHandler(response.data.preset, preset);
            });
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
                        <Space>
                        {!isEditing ? (
                            <>
                                <span>{preset['name']}</span>
                                {isShown && (
                                    <Button className="edit-btn" size="small" type="link" icon={<EditOutlined />} onClick={toggleEdit}>
                                        {t('rename')}
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Form form={editForm}>
                                <Form.Item
                                    name="name"
                                    className="input-editable"
                                    {...('name' in errorsEdit && {
                                        help: (
                                            <Trans
                                                i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errorsEdit['name'])}
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
                                    <Input
                                        className="input"
                                        onPressEnter={handleSaveEdit}
                                        suffix={
                                            <>
                                                <Popconfirm title={t('cancel_edit')} placement="leftTop" onConfirm={() => cancelEdit()}>
                                                    <Button
                                                        icon={<CloseOutlined />}
                                                        size="small"
                                                        //onClick={cancelEdit}
                                                        className="cell-input-cancel"
                                                    />
                                                </Popconfirm>
                                                <Button
                                                    icon={<CheckOutlined />}
                                                    size="small"
                                                    onClick={handleSaveEdit}
                                                    type="primary"
                                                    className="cell-input-save"
                                                />
                                            </>
                                        }
                                    />
                                </Form.Item>
                            </Form>
                        )}
                        </Space>
                    </div>
                }
                extra={
                    <div className="table-actions">
                        <Popconfirm
                            title={t('delete_preset_confirm')}
                            icon={<QuestionCircleOutlined className="red-icon" />}
                            onConfirm={() => handleDelete()}
                        >
                            <Link>
                                <DeleteOutlined /> <Trans i18nKey="delete" />
                            </Link>
                        </Popconfirm>
                    </div>
                }
            >
                {preset.categories.map((item, subIndex) => {
                    return <Tooltip
                        key={subIndex + '-' + item.name}
                        placement={LocaleService.direction == 'rtl' ? item.enabled == true ? 'leftTop' : 'left' : item.enabled ? 'rightTop' : 'right'}
                        overlayClassName={item.enabled ? "install-tooltip" : "title-tooltip"}
                        title={item.enabled == true ?
                            <>
                                <Title level={5}>{item.name}</Title>
                                <ul>
                                    {item.subcategories.map((subItem) => (
                                        <li
                                            key={item.name + '_' + subItem.name}
                                            className={subItem.value == "" ? 'text-grey' : 'text-black'}
                                        >
                                            {subItem.name.replaceAll('_', ' ').charAt(0).toUpperCase() +
                                                subItem.name.replaceAll('_', ' ').slice(1)}
                                        </li>
                                    ))}
                                </ul>
                            </> : <Title level={5}>{item.name}</Title>
                        }
                    >
                        <Button
                            onClick={() => showModal(item.name, item.subcategories)}
                            disabled={!item.enabled}
                            type="link"
                            icon={<DynamicIcon type={getIconName(item.name)} className={'PresetIcon'} />}
                        />
                    </Tooltip>
                })}
                <Modal
                    title={modalTitle}
                    className="presets-modal"
                    centered
                    visible={isModalVisible}
                    onOk={() => setIsModalVisible(false)}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <div className="presets-body">
                        <Form>
                            {modalContent.map((item) => (
                                <div key={modalTitle + '_' + item.name}>
                                    <Form.Item label={getName(item.name)} name={item.name} /*switch valuePropName={item.name}*/>
                                        {item.type == 'bool' && (
                                            <Switch
                                                defaultChecked={item.value == true ? true : false}
                                                onChange={(checked) => {
                                                    item.value = checked;
                                                }}
                                            />
                                        )}

                                        {item.type === 'string' && (
                                            <Input
                                                //style={{ 'width': 'fit-content' }}
                                                className="preset-input"
                                                defaultValue={item.value}
                                                placeholder={getName(item.name)}
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
                                                <Button icon={<UploadOutlined />}>
                                                    Upload jpg, jpeg, png only
                                                </Button>
                                                {item.value}
                                            </Upload>
                                        )}

                                        {item.type === 'integer' && (
                                            <InputNumber
                                                min={1}
                                                max={100}
                                                defaultValue={item.value}
                                                placeholder={item.name}
                                                onChange={(val) => (item.value = val)}
                                            />
                                        )}
                                    </Form.Item>
                                </div>
                            ))}
                            <Form.Item className="modal-submit-btn button-container">
                                <Button type="text" className="cancel-btn prev" block onClick={() => setIsModalVisible(false)}>
                                    <Trans i18nKey="cancel" />
                                </Button>
                                <Button type="primary" htmlType="submit" block onClick={() => saveEditPresetCategory(modalTitle, preset, modalContent)}>
                                    <Trans i18nKey="save" />
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Modal>
            </Card>
        </Col>
    );
};

const Presets = () => {
    const [currentUser, setCurrentUser] = React.useState<UserType>(null);
    const [myPresets, setMyPresets] = useState<MyPresetType[]>([]);
    const [errorsAdd, setErrorsAdd] = useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const user: UserType = authService.getCurrentUser();
        setCurrentUser(user);
        PresetsService.collect_my_presets(user.id)
            .then((response) => {
                setMyPresets(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    //add
    const handleAdd = (values) => {
        const formValues: formType = values;
        setErrorsAdd([]);
        PresetsService.add_preset(formValues, currentUser.id)
            .then((response) => {
                setIsModalVisible(false);
                const newPreset: MyPresetType = response.data.preset;
                Notifications.openNotificationWithIcon('success', t('add_preset_success'));
                addForm?.resetFields();
                setMyPresets([...myPresets, newPreset]);
            })
            .catch((error) => {
                const responseData = error.response.data;
                if (responseData.errors) {
                    setErrorsAdd(responseData.errors);
                }
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

    //edit
    const editPreset = (newPreset: MyPresetType, oldPreset: MyPresetType) => {
        const newPresets = [...myPresets];
        const index = newPresets.findIndex((item) => oldPreset.id === item.id);
        if (index > -1 && newPreset != undefined) {
            const item = newPresets[index];
            newPresets.splice(index, 1, {
                ...item,
                ...newPreset,
            });
            setMyPresets(newPresets);
            Notifications.openNotificationWithIcon('success', t('edit_preset_success'));
        }
    }

    //delete
    const deletePreset = (id) => {
        PresetsService.delete_preset(id)
            .then(() => {
                setMyPresets(myPresets.filter((p) => p.id != id));
                Notifications.openNotificationWithIcon('success', t('delete_preset_success'));
            })
            .catch((error) => {
                console.log(error);
            });
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
                        content={t('bigbluebutton_rooms_settings')}
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
                {isLoading ? <Spin size="large" />
                    : myPresets.length == 0 ?
                        <Empty
                            imageStyle={{
                                height: 200,
                            }}
                        />
                        : myPresets.map((singlePresets) => (
                            <PresetsCol
                                key={singlePresets.id}
                                preset={singlePresets}
                                editClickHandler={editPreset}
                                deleteClickHandler={deletePreset.bind(this, singlePresets.id)}
                            />
                        ))
                }
            </Row>
        </>
    );
};

export default withTranslation()(Presets);
