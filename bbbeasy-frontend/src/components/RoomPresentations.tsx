/**
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBEasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

import React, { useState } from 'react';
import { Trans } from 'react-i18next';

import { Card, Modal, Typography, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';
import { RcFile, UploadProps } from 'antd/es/upload';
import Notifications from "./Notifications";
import { t } from 'i18next';

const { Title } = Typography;
type Props = {
    open: boolean;
};
const RoomPresentations = (props: Props) => {
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [fileList, setFileList] = useState<UploadFile[]>([
        {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        },
        {
            uid: '-2',
            name: 'image.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        },
        {
            uid: '-3',
            name: 'image.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        },
        {
            uid: '-4',
            name: 'image.png',
            status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        },
    ]);

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

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };
    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    {
        {
            const XLS  = 'application/vnd.ms-excel';
            const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const DOC  = 'application/msword';
            const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            const PPT  = 'application/vnd.ms-powerpoint';
            const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            const ODT  = 'application/vnd.oasis.opendocument.text';
            const RTF  = 'application/rtf';
            const TXT  = 'text/plain';
            const ODS  = 'application/vnd.oasis.opendocument.spreadsheet';
            const ODP  = 'application/vnd.oasis.opendocument.presentation';
            const PDF  = 'application/pdf';
            const JPEG = 'image/jpeg';
            const PNG  = 'image/png';
            const SVG  = 'image/svg+xml';

            const validFormats = [
                XLS, XLSX, DOC, DOCX, PPT, PPTX, ODT, RTF,
                TXT, ODS, ODP, PDF, JPEG, PNG, SVG
            ];

            const lastFile= newFileList[(newFileList.length)-1];
            const filetype = lastFile.type;

            if(filetype != undefined && validFormats.includes(filetype)){
                setFileList(newFileList);
                return;
            }
            Notifications.openNotificationWithIcon('error', t('invalid_format'));
        }
    }

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
                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={handlePreview}
                            onChange={handleChange}
                        >
                            {fileList.length >= 8 ? null : uploadButton}
                        </Upload>
                    </Card>
                    <Modal open={previewOpen} footer={null} onCancel={handleCancel} maskClosable={true}>
                        <img className="full-width" src={previewImage} />
                    </Modal>
                </>
            )}
        </>
    );
};

export default RoomPresentations;
