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
import { FileTwoTone, LoadingOutlined, PictureTwoTone, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';
import { RcFile, UploadProps } from 'antd/es/upload';

import { axiosInstance } from '../lib/AxiosInstance';
import { apiRoutes } from '../routing/backend-config';
import Notifications from './Notifications';

import pdfFileIcon from '../assets/room-presentation-pdf.svg';
import pptFileIcon from '../assets/room-presentation-ppt.svg';
import wordFileIcon from '../assets/room-presentation-word.svg';

const { Title } = Typography;

type Props = {
    roomId: number;
    open: boolean;
};

const MAX_PRESENTATIONS = 8;

// Total raw size budget for the pre-uploaded presentations: the file content is
// embedded (base64) in the POST body of the BBB /create request, whose limit on
// this server is ~1 MB (measured). Files above this budget are stored/displayed
// but cannot be pre-loaded into the meeting.
const PRE_UPLOAD_MAX_BYTES = 768000;

// Detect the file kind from its extension so the thumbnail tile shows the
// matching logo (PDF / PowerPoint / Word) instead of a broken image.
const getFileKind = (name: string): 'pdf' | 'ppt' | 'word' | null => {
    const ext = (name || '').split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'ppt' || ext === 'pptx') return 'ppt';
    if (ext === 'doc' || ext === 'docx') return 'word';
    return null;
};

const FileTypeIcon = ({ kind, name }: { kind: 'pdf' | 'ppt' | 'word'; name: string }) => {
    const src = kind === 'pdf' ? pdfFileIcon : kind === 'ppt' ? pptFileIcon : wordFileIcon;

    return (
        <div className={`room-presentations-file-thumb ${kind}`}>
            <img className="room-presentations-file-icon" src={src} alt={kind.toUpperCase()} />
            <span className="room-presentations-file-name" title={name}>
                {name}
            </span>
        </div>
    );
};

const RoomPresentations = (props: Props) => {
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [previewSize, setPreviewSize] = useState<number>(0);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    // Map of stored file name -> original file name (kept for display/download).
    const [originalNames, setOriginalNames] = useState<Record<string, string>>({});

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
                        size: presentation.size ?? 0,
                    }))
                );
                setOriginalNames(
                    presentations.reduce((acc: Record<string, string>, presentation) => {
                        acc[presentation.name] = presentation.original || presentation.name;

                        return acc;
                    }, {})
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

    // PDF / Word / PowerPoint files are not previewed in a popup: fetch the
    // file as a blob and trigger a download, so the user can open it locally
    // (in the browser viewer or the installed application).
    const downloadPresentation = async (file: UploadFile) => {
        if (!file.url) {
            return;
        }
        try {
            const response = await axiosInstance.get(file.url, { responseType: 'blob' });
            const objectUrl = URL.createObjectURL(response.data as Blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = originalNames[file.name || ''] || file.name || 'presentation';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            Notifications.openNotificationWithIcon('success', t('presentation_download_started'));
        } catch (error) {
            console.log(error);
            Notifications.openNotificationWithIcon('error', t('presentation_download_error'));
        }
    };

    const handlePreview = async (file: UploadFile) => {
        const fileKind = getFileKind(file.name || '');
        if (fileKind) {
            await downloadPresentation(file);

            return;
        }

        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewSize(Number(file.size) || 0);
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
                if (presentation.original) {
                    setOriginalNames((prev) => ({ ...prev, [presentation.name]: presentation.original }));
                }

                return {
                    ...file,
                    uid: presentation.name,
                    name: presentation.name,
                    url: presentation.url,
                    size: presentation.size ?? file.size ?? 0,
                    status: 'done',
                } as UploadFile;
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

    const overLimitCount = fileList.filter((file) => Number(file.size) > PRE_UPLOAD_MAX_BYTES).length;

    const iconRender = (file: UploadFile) => {
        const fileKind = getFileKind(file.name || '');
        if (fileKind) {
            return <FileTypeIcon kind={fileKind} name={originalNames[file.name || ''] || file.name || ''} />;
        }

        // Fall back to antd defaults for anything else (images, uploading state)
        if (file.status === 'uploading') {
            return <LoadingOutlined />;
        }
        return (file.type || '').startsWith('image/') ? <PictureTwoTone /> : <FileTwoTone />;
    };

    return (
        <>
            {props.open && (
                <>
                    <Card bordered={false} size="small" className="room-presentations gray-bg">
                        <Title level={5}>
                            <Trans i18nKey="room_ppts" />
                        </Title>
                        {overLimitCount > 0 && (
                            <div className="room-presentations-size-warning">
                                <WarningOutlined />
                                <span>
                                    <Trans i18nKey="presentation_preupload_size_warning" />
                                </span>
                            </div>
                        )}
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={handlePreview}
                            onChange={handleChange}
                            onRemove={handleRemove}
                            customRequest={customRequest}
                            beforeUpload={beforeUpload}
                            iconRender={iconRender}
                            accept=".png,.jpg,.jpeg,.pdf,.ppt,.pptx,.doc,.docx"
                        >
                            {fileList.length >= MAX_PRESENTATIONS ? null : uploadButton}
                        </Upload>
                    </Card>
                    <Modal open={previewOpen} footer={null} onCancel={handleCancel} maskClosable={true}>
                        <img className="full-width" src={previewImage} />
                        {previewSize > PRE_UPLOAD_MAX_BYTES && (
                            <div className="room-presentations-preview-size-warning">
                                <WarningOutlined />
                                <span>
                                    <Trans i18nKey="presentation_preupload_size_warning_file" />
                                </span>
                            </div>
                        )}
                    </Modal>
                </>
            )}
        </>
    );
};

export default RoomPresentations;
