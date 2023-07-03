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

import React, { useEffect, useState } from 'react';

import { Trans } from 'react-i18next';

import { Card, Modal, Typography, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/es/upload/interface';
import { RcFile, UploadProps } from 'antd/es/upload';
import Notifications from "./Notifications";
import { t } from 'i18next';
import RoomPresentationsService from "../services/room.presentations.service";
import {apiRoutes} from "../routing/backend-config";
import axios from 'axios';

const { Title } = Typography;
type Props = {
    room_id: number;
};

const RoomPresentations = (props: Props) => {
    const room = props;
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const getRoomPresentationsByRoom = () => {
        console.log(room.room_id);
        RoomPresentationsService.list_roomPresentations(room.room_id)
            .then((response) => {
                if(typeof response.data === "object"){
                    const myData = response.data;
                    Object.keys(myData).forEach((key,item) => {
                        myData[key]['url']= process.env.REACT_APP_API_URL +"/"+myData[key]['url'];
                    })
                    setFileList(response.data);
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }
    useEffect(() => {
        getRoomPresentationsByRoom();
    }, []);

    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    //delete
    const deleteRoomPresentation = async (file: UploadFile) => {
        RoomPresentationsService.delete_roomPresentations(Number(file.uid))
            .then(() => {
                Notifications.openNotificationWithIcon('success', t('delete_room_presentation_success'));
                getRoomPresentationsByRoom();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    {
        {
            if(fileList[0] != undefined && fileList[0]['status']=='removed' || fileList.length > newFileList.length){
                if(fileList.length){
                    fileList.shift();
                }
                setFileList(newFileList);
                return;
            }

            const XLS = 'application/vnd.ms-excel';
            const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const DOC = 'application/msword';
            const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            const PPT = 'application/vnd.ms-powerpoint';
            const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            const ODT = 'application/vnd.oasis.opendocument.text';
            const RTF = 'application/rtf';
            const TXT = 'text/plain';
            const ODS = 'application/vnd.oasis.opendocument.spreadsheet';
            const ODP = 'application/vnd.oasis.opendocument.presentation';
            const PDF = 'application/pdf';
            const JPEG = 'image/jpeg';
            const PNG = 'image/png';
            const SVG = 'image/svg+xml';

            const validFormats =
                {
                    ".xls": XLS,
                    ".xlsx": XLSX,
                    ".doc": DOC,
                    ".docx": DOCX,
                    ".ppt": PPT,
                    ".pptx": PPTX,
                    ".odt": ODT,
                    ".rtf": RTF,
                    ".txt": TXT,
                    ".ods": ODS,
                    ".odp": ODP,
                    ".pdf": PDF,
                    ".jpeg": JPEG,
                    ".png": PNG,
                    ".svg": SVG
                };

            if (newFileList.length != 0) {
            const lastFile = newFileList[(newFileList.length) - 1];
            const filetype = lastFile.type;
            const filename = lastFile.name;
            let validFormat = Object.values(validFormats).includes(filetype);

            if (filetype != undefined && validFormat) {
                let typeFormat = "";
                for (const key in validFormats) {
                    if (validFormats[key] == filetype) {
                        validFormat = true;
                        typeFormat = key;
                        break;
                    }
                }

                /*Begin ADD room presentation*/

                let roomPresentation = filename.substr(0,filename.indexOf("."));
                roomPresentation = roomPresentation.replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, "-")
                roomPresentation = roomPresentation.replaceAll(' ', "-");
                const new_fileName = (roomPresentation+"-"+ Date.now() + typeFormat);

                const myArray = new_fileName.split("-");
                const newArray = [];
                for (let i = 0; i < myArray.length; i++) {
                    if(myArray[i] != "") {
                        if(i==0){
                            newArray.push(myArray[i]);
                        }else{
                            newArray.push("-"+myArray[i]);
                        }
                    }
                }
                const myRoomPresentation=newArray.toString().replaceAll(",",'');
                RoomPresentationsService.add_roomPresentations(myRoomPresentation, room.room_id)
                    .then((response) => {
                        getRoomPresentationsByRoom();
                        Notifications.openNotificationWithIcon('success', t('add_room_presentation_success'));
                        return;
                    })
                    .catch((error) => {
                        console.log(error);
                    })

                /*End ADD room presentation*/

                // save file
                const formData: FormData = new FormData();
                formData.append('logo', lastFile.originFileObj, myRoomPresentation);
                formData.append('logo_name', myRoomPresentation);
                axios.post(apiRoutes.SAVE_FILE_URL, formData)
                    .then((response) => {
                        console.log(response);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                
            } else {
                Notifications.openNotificationWithIcon('error', t('invalid_format'));
            }
        }
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
            <Card bordered={false} size="small" className="room-presentations gray-bg">
                <Title level={5}>
                    <Trans i18nKey="room_ppts" />
                </Title>
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleChange}
                    onRemove={deleteRoomPresentation}
                >

                    {fileList.length >= 8 ? null : uploadButton}
                </Upload>
            </Card>
        </>
    );
};

export default RoomPresentations;