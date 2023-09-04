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

import React, { useEffect, useState } from 'react';

import { PageHeader } from '@ant-design/pro-layout';

import {
    Button,
    Card,
    theme,
    ColorPicker,
    Row,
    Col,
    Form,
    Input,
    Modal,
    Popconfirm,
    Popover,
    Typography,
    Tooltip,
    Switch,
    Upload,
    message,
    InputNumber,
    Space,
    Dropdown,
    Menu,
    Select,
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    EditOutlined,
    MoreOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
    UploadOutlined,
    WarningOutlined,
} from '@ant-design/icons';

import { initReactI18next, Trans, withTranslation } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';

import DynamicIcon from './DynamicIcon';
import LoadingSpinner from './LoadingSpinner';
import EmptyData from './EmptyData';
import { getIconName } from '../types/GetIconName';
import { DataContext } from 'lib/RoomsContext';
import AddPresetForm from './AddPresetForm';
import Notifications from './Notifications';

import axios from 'axios';
import { apiRoutes } from '../routing/backend-config';
import PresetsService from '../services/presets.service';
import AuthService from '../services/auth.service';
import LocaleService from '../services/locale.service';

import { UserType } from 'types/UserType';
import { MyPresetType } from '../types/MyPresetType';
import { SubCategoryType } from '../types/SubCategoryType';
import { UploadFile } from 'antd/lib/upload/interface';
import type { Color } from 'antd/es/color-picker';
import ReactDomServer from 'react-dom/server';
import { getType } from 'react-styleguidist/lib/client/rsg-components/Props/util';
import { LanguagesBBB } from './LanguagesBBB';
import { GuestPolicy } from './GuestPolicy';
import { isEmpty } from 'lodash';

const { Title } = Typography;

interface PresetColProps {
    key: number;
    preset: MyPresetType;
    editName: boolean;
    editClickHandler: (newPreset: MyPresetType, oldPreset: MyPresetType) => void;
    copyClickHandler: () => void;
    deleteClickHandler: () => void;
}
type formType = {
    name: string;
};

const PresetsCol: React.FC<PresetColProps> = ({
    key,
    preset,
    editName,
    editClickHandler,
    copyClickHandler,
    deleteClickHandler,
}) => {
    const [file, setFile] = React.useState<UploadFile>(null);
    const [fileList, setFileList] = React.useState<UploadFile[]>(null);
    const [isShown, setIsShown] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = React.useState<string>('');
    const [modalTitleTrans, setModalTitleTrans] = React.useState<string>('');
    const [modalContent, setModalContent] = React.useState<SubCategoryType[]>([]);
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [errorsEdit, setErrorsEdit] = React.useState({});
    const isDefault = preset['name'] == 'default';
    const deleteEnabled = deleteClickHandler != null && !isDefault;
    const { token } = theme.useToken();
    const [color, setColor] = useState<Color | string>(token.colorPrimary);

    const props = {
        beforeUpload: (file) => {
            const isPNG = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';
            if (!isPNG) {
                message.error(`${file.name} is not a img file`);
            }
            return isPNG || Upload.LIST_IGNORE;
        },
        onChange: (info) => {
            let fileList: UploadFile[] = [...info.fileList];
            fileList = fileList.slice(-1);
            if (fileList[0] != undefined) {
                const img: boolean =
                    fileList[0].type === 'image/jpg' ||
                    fileList[0].type === 'image/jpeg' ||
                    fileList[0].type === 'image/png';
                if (img) {
                    setFileList(fileList);
                    setFile(fileList[0]);
                }
            }
        },
        onRemove: () => {
            setFileList(null);
            setFile(null);
        },
    };

    const getData = () => {
        if ('Guest Policy' === modalTitle) {
            return GuestPolicy;
        } else {
            return LanguagesBBB;
        }
    };
    const showModal = (title: string, titleTrans: string, content: SubCategoryType[]) => {
        setIsModalVisible(true);
        setModalTitle(title);
        setModalTitleTrans(titleTrans);
        setModalContent(content);

        const indexLogo = content.findIndex((item) => item.type === 'file');
        if (indexLogo > -1 && content[indexLogo].value != '') {
            const presetLogo: UploadFile = {
                uid: '1',
                name: content[indexLogo].value,
                status: 'done',
            };
            setFileList([presetLogo]);
            setFile(presetLogo);
        }
    };

    //delete
    const handleDelete = () => {
        if (preset.nb_rooms > 0) {
            Modal.confirm({
                wrapClassName: 'delete-wrap',
                title: null,
                icon: null,
                content: (
                    <>
                        <WarningOutlined className="delete-icon" />
                        <span className="ant-modal-confirm-title">
                            <Trans i18nKey="delete_preset_title" />
                        </span>
                        <Trans i18nKey="delete_preset_content" />
                    </>
                ),
                okType: 'danger',
                okText: <Trans i18nKey="confirm_yes" />,
                cancelText: <Trans i18nKey="confirm_no" />,
                onOk: () => deleteClickHandler(),
            });
        } else {
            deleteClickHandler();
        }
    };

    //edit name
    const [editForm] = Form.useForm();
    const toggleEdit = () => {
        setIsEditing(true);
        editForm.setFieldsValue({ name: preset['name'] });
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
    };

    //edit category
    const saveEditPresetCategory = (title: string, preset: MyPresetType, subCategories: SubCategoryType[]) => {
        setIsModalVisible(false);
        const indexLogo = subCategories.findIndex((item) => item.type === 'file');
        //edit file
        if (indexLogo > -1 && file != undefined && file.originFileObj != null) {
            const formData: FormData = new FormData();
            formData.append('logo', file.originFileObj, file.originFileObj.name);
            formData.append('logo_name', file.originFileObj.name);

            axios
                .post(apiRoutes.SAVE_FILE_URL, formData)
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.log(error);
                });
        }

        if (indexLogo > -1) {
            // updated logo
            if (file != undefined && file.originFileObj != null) {
                subCategories[indexLogo].value = file.name;
            }
            //deleted logo
            else if (file == undefined && subCategories[indexLogo].value != null) {
                subCategories[indexLogo].value = '';
            }
        }

        PresetsService.edit_subcategory_preset(title, subCategories, preset.id).then((response) => {
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
                                    <Tooltip
                                        key="tooltipLabels"
                                        overlayClassName="install-tooltip"
                                        title={preset['name']}
                                    >
                                        <div className='preset-name'>{preset['name']}</div>
                                    </Tooltip>
                                    {isShown && editName && !isDefault && (
                                        <Button
                                            className="edit-btn"
                                            size="small"
                                            type="link"
                                            icon={<EditOutlined />}
                                            onClick={toggleEdit}
                                        >
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
                                                    i18nKey={Object.keys(EN_US).filter(
                                                        (elem) => EN_US[elem] == errorsEdit['name']
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
                                        ]}
                                    >
                                        <Input
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
                                </Form>
                            )}
                        </Space>
                    </div>
                }
                extra={
                    copyClickHandler != null || deleteEnabled ? (
                        <Dropdown
                            key="more"
                            overlay={
                                <Menu>
                                    {copyClickHandler != null && (
                                        <Menu.Item key="1" onClick={copyClickHandler}>
                                            <Trans i18nKey={'copy'} />
                                        </Menu.Item>
                                    )}
                                    {deleteEnabled && (
                                        <Popconfirm
                                            title={t('delete_preset_confirm')}
                                            icon={<QuestionCircleOutlined className="red-icon" />}
                                            onConfirm={() => handleDelete()}
                                        >
                                            <Menu.Item key="2" danger>
                                                <Trans i18nKey={'delete'} />
                                            </Menu.Item>
                                        </Popconfirm>
                                    )}
                                </Menu>
                            }
                            placement={LocaleService.direction == 'rtl' ? 'bottomLeft' : 'bottomRight'}
                        >
                            <MoreOutlined />
                        </Dropdown>
                    ) : null
                }
            >
                {preset.categories.map((item, subIndex) => {
                    const filteredElements = Object.keys(EN_US).filter((elem) => EN_US[elem] == item.name);
                    const category = filteredElements.length != 0 ? filteredElements[0] : item.name;

                    return (
                        <>
                            {item.enabled && (
                                <Tooltip
                                    key={subIndex + '-' + item.name}
                                    placement={
                                        LocaleService.direction == 'rtl'
                                            ? item.enabled == true
                                                ? 'leftTop'
                                                : 'left'
                                            : item.enabled
                                            ? 'rightTop'
                                            : 'right'
                                    }
                                    overlayClassName={item.enabled ? 'install-tooltip' : 'title-tooltip'}
                                    title={
                                        item.enabled == true ? (
                                            <>
                                                <Title level={5}>{t(category)}</Title>
                                                <ul>
                                                    {item.subcategories.map((subItem) => (
                                                        <li
                                                            key={item.name + '_' + subItem.name}
                                                            className={subItem.value == '' ? 'text-grey' : 'text-black'}
                                                        >
                                                            {t(subItem.name)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        ) : (
                                            <Title level={5}>{t(category)}</Title>
                                        )
                                    }
                                >
                                    <Button
                                        onClick={() =>
                                            editClickHandler != null
                                                ? showModal(item.name, category, item.subcategories)
                                                : null
                                        }
                                        disabled={!item.enabled}
                                        type="link"
                                        icon={<DynamicIcon type={getIconName(item.name)} className={'PresetIcon'} />}
                                    />
                                </Tooltip>
                            )}
                        </>
                    );
                })}

                {editClickHandler != null && (
                    <Modal
                        title={t(modalTitle)}
                        className="presets-modal"
                        centered
                        open={isModalVisible}
                        onOk={() => setIsModalVisible(false)}
                        onCancel={() => setIsModalVisible(false)}
                        footer={null}
                        maskClosable={true}
                    >
                        <div className="presets-body">
                            <Form>
                                {modalContent.map((item) => (
                                    <>
                                        {typeof item.type !== 'boolean' && (
                                            <div key={modalTitle + '_' + item.name}>
                                                <Form.Item
                                                    label={
                                                        item.name.length > 30 ? (
                                                            <div className="white-space">{t(item.name)}</div>
                                                        ) : (
                                                            t(item.name)
                                                        )
                                                    }
                                                    name={item.name}
                                                >
                                                    {item.type == 'bool' && (
                                                        <>
                                                            <input
                                                                className="input-status-presets"
                                                                disabled
                                                                type="text"
                                                                id={item.name}
                                                                value={
                                                                    item.value == true
                                                                        ? ReactDomServer.renderToString(
                                                                              <Trans i18nKey="status_presets_active" />
                                                                          )
                                                                        : ReactDomServer.renderToString(
                                                                              <Trans i18nKey="status_presets_inactive" />
                                                                          )
                                                                }
                                                            />

                                                            <Switch
                                                                defaultChecked={item.value == true ? true : false}
                                                                onChange={(checked) => {
                                                                    item.value = checked;
                                                                    if (item.value) {
                                                                        (
                                                                            document.getElementById(
                                                                                item.name
                                                                            ) as HTMLInputElement
                                                                        ).value = ReactDomServer.renderToString(
                                                                            <Trans i18nKey="status_presets_active" />
                                                                        );
                                                                    } else {
                                                                        (
                                                                            document.getElementById(
                                                                                item.name
                                                                            ) as HTMLInputElement
                                                                        ).value = ReactDomServer.renderToString(
                                                                            <Trans i18nKey="status_presets_inactive" />
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        </>
                                                    )}

                                                    {item.type === 'string' && (
                                                        <Input
                                                            defaultValue={item.value}
                                                            placeholder={t(item.name)}
                                                            onChange={(event) => {
                                                                item.value = event.target.value;
                                                            }}
                                                        />
                                                    )}

                                                    {item.type === 'color' && (
                                                        <ColorPicker
                                                            value={item.value ? item.value : '#fbbc0b'}
                                                            onChange={(color1: Color) => {
                                                                setColor(color1);
                                                                item.value =
                                                                    typeof color1 === 'string'
                                                                        ? color1
                                                                        : color1.toHexString();
                                                            }}
                                                        >
                                                            <Space className="space-presets-border">
                                                                <div
                                                                    style={{
                                                                        width: token.sizeMD,
                                                                        height: token.sizeMD,

                                                                        backgroundColor: item.value
                                                                            ? item.value
                                                                            : '#fbbc0b',
                                                                    }}
                                                                />
                                                            </Space>
                                                        </ColorPicker>
                                                    )}

                                                    {item.type === 'file' && (
                                                        <Upload
                                                            {...props}
                                                            multiple={false}
                                                            name={item.name}
                                                            fileList={fileList}
                                                            accept=".png,.jpg,.jpeg"
                                                        >
                                                            <Button icon={<UploadOutlined />}>
                                                                <Trans i18nKey="upload_img" />
                                                            </Button>
                                                        </Upload>
                                                    )}

                                                    {item.type === 'integer' && (
                                                        <InputNumber
                                                            min={0}
                                                            max={100}
                                                            defaultValue={item.value}
                                                            placeholder={t(item.name)}
                                                            onChange={(val) => (item.value = val)}
                                                        />
                                                    )}

                                                    {item.type === 'select' && (
                                                        <Select
                                                            defaultValue={item.value}
                                                            options={getData().map((data) => ({
                                                                label:
                                                                    'Guest Policy' == modalTitle
                                                                        ? ReactDomServer.renderToString(
                                                                              <Trans i18nKey={data.key} />
                                                                          )
                                                                        : data.name,
                                                                value: data.value,
                                                            }))}
                                                            onChange={(event) => {
                                                                item.value = event;
                                                                console.log(event);
                                                            }}
                                                        />
                                                    )}
                                                </Form.Item>
                                            </div>
                                        )}
                                    </>
                                ))}
                                <Form.Item className="button-container">
                                    <Button
                                        type="text"
                                        className="cancel-btn prev"
                                        block
                                        onClick={() => setIsModalVisible(false)}
                                    >
                                        <Trans i18nKey="cancel" />
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        onClick={() => saveEditPresetCategory(modalTitle, preset, modalContent)}
                                    >
                                        <Trans i18nKey="save" />
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </Modal>
                )}
            </Card>
        </Col>
    );
};

const Presets = () => {
    const [myPresets, setMyPresets] = useState<MyPresetType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [actions, setActions] = React.useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const dataContext = React.useContext(DataContext);
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const results = !searchTerm
        ? myPresets
        : myPresets.filter((preset) => preset.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()));

    useEffect(() => {
        const currentUser: UserType = AuthService.getCurrentUser();
        PresetsService.list_presets(currentUser.id)
            .then((response) => {
                setMyPresets(response.data);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setIsLoading(false);
            });

        const presetsActions = AuthService.getActionsPermissionsByGroup('presets');
        setActions(presetsActions);
    }, []);

    //edit
    const editPreset = (newPreset: MyPresetType, oldPreset: MyPresetType) => {
        if(newPreset.name == oldPreset.name){
            Notifications.openNotificationWithIcon('info', t('no_changes'));
            return
        }
        const newPresets = [...myPresets];
        const index = newPresets.findIndex((item) => oldPreset.id === item.id);
        if (index > -1 && newPreset != undefined) {
            const item = newPresets[index];
            newPresets.splice(index, 1, {
                ...item,
                ...newPreset,
            });
            setMyPresets(newPresets);
            dataContext.setDataPresets(newPresets);

            Notifications.openNotificationWithIcon('success', t('edit_preset_success'));
        }
    };

    //copy
    const copyPreset = (id) => {
        PresetsService.copy_preset(id)
            .then((response) => {
                //add new preset
                const newPreset: MyPresetType = response.data.preset;
                setMyPresets([...myPresets, newPreset]);
                dataContext.setDataPresets([...dataContext.dataPresets, newPreset]);

                Notifications.openNotificationWithIcon('success', t('copy_preset_success'));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    //delete
    const deletePreset = (id) => {
        PresetsService.delete_preset(id)
            .then(() => {
                setMyPresets(myPresets.filter((p) => p.id != id));
                const indexPreset = dataContext.dataPresets.findIndex((item) => id === item.id);
                if (indexPreset !== -1) {
                    dataContext.dataPresets.splice(indexPreset, 1);
                }
                Notifications.openNotificationWithIcon('success', t('delete_preset_success'));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <>
            <PageHeader
                title={<Trans i18nKey="presets" />}
                subTitle={
                    <Input
                        className="search-input"
                        size="middle"
                        placeholder={t('search_preset')}
                        allowClear
                        suffix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={handleChange}
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
                    AuthService.isAllowedAction(actions, 'add') && (
                        <Button key="1" type="primary" onClick={() => setIsModalVisible(true)}>
                            <Trans i18nKey="new_preset" />
                        </Button>
                    ),
                ]}
            />

            {AuthService.isAllowedAction(actions, 'add') && (
                <AddPresetForm
                    isModalShow={isModalVisible}
                    close={() => {
                        setIsModalVisible(false);
                    }}
                />
            )}
            <Row gutter={[32, 32]} justify="center" className="presets-cards">
                {isLoading ? (
                    <LoadingSpinner />
                ) : myPresets.length == 0 ? (
                    <EmptyData description={<Trans i18nKey="no_presets" />} className="empty-presets" />
                ) : (
                    results.map((singlePresets) => (
                        <PresetsCol
                            key={singlePresets.id}
                            preset={singlePresets}
                            editName={AuthService.isAllowedAction(actions, 'edit')}
                            editClickHandler={
                                AuthService.isAllowedAction(actions, 'edit_subcategories') ? editPreset : null
                            }
                            copyClickHandler={
                                AuthService.isAllowedAction(actions, 'copy')
                                    ? copyPreset.bind(this, singlePresets.id)
                                    : null
                            }
                            deleteClickHandler={
                                AuthService.isAllowedAction(actions, 'delete')
                                    ? deletePreset.bind(this, singlePresets.id)
                                    : null
                            }
                        />
                    ))
                )}
            </Row>
        </>
    );
};

export default withTranslation()(Presets);
