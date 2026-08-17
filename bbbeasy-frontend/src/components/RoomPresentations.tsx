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
 * with BBBeasy; if not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { t } from 'i18next';

import { Card, Modal, Typography, Upload, message } from 'antd';
import { FilePptOutlined, FileWordOutlined, PlusOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';
import { RcFile, UploadProps } from 'antd/es/upload';

import { axiosInstance } from '../lib/AxiosInstance';
import { apiRoutes } from '../routing/backend-config';
import Notifications from './Notifications';

const { Title } = Typography;

type Props = {
    roomId: number;
    open: boolean;
};

const MAX_PRESENTATIONS = 8;

const RoomPresentations = (props: Props) => {
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [previewKind, setPreviewKind] = useState<'image' | 'pdf' | 'office'>('image');
    const [previewName, setPreviewName] = useState<string>('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (!props.open || !props.roomId) {
            return;
        }
        axiosInstance
            .get(apiRoutes.LIST_ROOM_PRESENTATIONS_URL + props.roomId)
            .then((response) => {
                const presentations = response.data.presentations ?? [];
                setFileList(
                    presentations.map((presentation) => ({
                        uid: presentation.name,
                        name: presentation.name,
                        status: 'done',
                        url: presentation.url,
                    }))
                );
            })
            .catch((error) => {
                console.log(error);
                setFileList([]);
            });
    }, [props.open, props.roomId]);

    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        const name = (file.name || '').toLowerCase();
        let kind: 'image' | 'pdf' | 'office' = 'image';
        if (name.endsWith('.pdf')) {
            kind = 'pdf';
        } else if (name.endsWith('.ppt') || name.endsWith('.pptx') || name.endsWith('.doc') || name.endsWith('.docx')) {
            kind = 'office';
        }
        setPreviewKind(kind);
        setPreviewName(file.name || '');
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const customRequest: UploadProps['customRequest'] = async (options) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('presentation', file as RcFile);

        try {
            const response = await axiosInstance.post(apiRoutes.ADD_ROOM_PRESENTATION_URL + props.roomId, formData);
            onSuccess(response.data, file);
            Notifications.openNotificationWithIcon('success', t('upload_presentation_success'));
        } catch (error) {
            onError(error);
            Notifications.openNotificationWithIcon('error', t('upload_presentation_error'));
        }
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        const mappedList = newFileList.map((file) => {
            const presentation = file.response?.presentation;
            if (presentation) {
                return {
                    ...file,
                    uid: presentation.name,
                    name: presentation.name,
                    url: presentation.url,
                    status: 'done',
                };
            }

            return file;
        });
        setFileList(mappedList);
    };

    const handleRemove: UploadProps['onRemove'] = async (file) => {
        // A file that was never persisted (failed/ongoing upload) has no server url
        // -> just remove it from the list without calling the backend.
        if (!file.url) {
            return true;
        }

        try {
            await axiosInstance.delete(
                apiRoutes.DELETE_ROOM_PRESENTATION_URL + props.roomId + '/' + encodeURIComponent(file.name)
            );
            Notifications.openNotificationWithIcon('success', t('delete_presentation_success'));

            return true;
        } catch (error) {
            console.log(error);
            Notifications.openNotificationWithIcon('error', t('delete_presentation_error'));

            return false;
        }
    };

    const beforeUpload = (file: RcFile) => {
        const extension = (file.name.split('.').pop() || '').toLowerCase();
        const isAllowed =
            [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ].includes(file.type) || ['ppt', 'pptx', 'doc', 'docx'].includes(extension);
        if (!isAllowed) {
            message.error(`${file.name} is not an image, PDF or Office file`);
        }

        return isAllowed || Upload.LIST_IGNORE;
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div className="mt-8 upload-file">
                <Trans i18nKey="upload" />
            </div>
        </div>
    );

    return (
        <>
            {props.open && (
                <>
                    <Card bordered={false} size="small" className="room-presentations gray-bg">
                        <Title level={5}>
                            <Trans i18nKey="room_ppts" />
                        </Title>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={handlePreview}
                            onChange={handleChange}
                            onRemove={handleRemove}
                            customRequest={customRequest}
                            beforeUpload={beforeUpload}
                            accept=".png,.jpg,.jpeg,.pdf,.ppt,.pptx,.doc,.docx"
                        >
                            {fileList.length >= MAX_PRESENTATIONS ? null : uploadButton}
                        </Upload>
                    </Card>
                    <Modal open={previewOpen} footer={null} onCancel={handleCancel} maskClosable={true}>
                        {previewKind === 'pdf' ? (
                            <iframe
                                className="full-width room-presentations-preview-pdf"
                                src={previewImage}
                                title="presentation-preview"
                            />
                        ) : previewKind === 'office' ? (
                            <div className="room-presentations-preview-office">
                                {previewName.toLowerCase().endsWith('.doc') || previewName.toLowerCase().endsWith('.docx') ? (
                                    <FileWordOutlined className="room-presentations-preview-office-icon" />
                                ) : (
                                    <FilePptOutlined className="room-presentations-preview-office-icon" />
                                )}
                                <Typography.Text className="room-presentations-preview-office-name">{previewName}</Typography.Text>
                                <Typography.Text className="room-presentations-preview-office-hint" type="secondary">
                                    <Trans i18nKey="presentation_preview_office_hint" />
                                </Typography.Text>
                            </div>
                        ) : (
                            <img className="full-width" src={previewImage} />
                        )}
                    </Modal>
                </>
            )}
        </>
    );
};

export default RoomPresentations;
