import React, { useEffect, useState } from 'react';

import { Trans } from 'react-i18next';

import {Button, Input, Modal, Space, Typography} from 'antd';
import CopyTextToClipBoard from "./CopyTextToClipBoard";
import {
    FacebookIcon,
    FacebookShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    TwitterIcon,
    TwitterShareButton
} from "react-share";
import Form from 'antd/lib/form';
import {RecordingType} from "../types/RecordingType";
import {ShareAltOutlined} from "@ant-design/icons";
import DynamicIcon from "./DynamicIcon";

const { Title } = Typography;
type Props = {
    recording : RecordingType;
    from      : string;
};

const ModalSocialLinks = (props: Props) => {
    const myRecording = props;
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const [modalFormats, setModalFormats] = React.useState<string[]>(null);
    const [modalUrl, setModalUrl] = React.useState<string>(null);
    const { Link } = Typography;

    // share
    const showModal = (formats: string[], url: string) => {
        setIsModalVisible(true);
        setModalFormats(formats);
        setModalUrl(url);
    };

    //room.link
    const handleShare = () => {
        console.log(myRecording.recording.url);
    };
    const cancelShare = () => {
        setIsModalVisible(false);
    };

    const getFormatIcons = (formats: string[], showDisabled?: boolean) => {
        const getFormatIcon = (format: string, icon: string, iconClass?: string) => {
            const enabled = formats.includes(format);
            if (enabled || showDisabled) {
                return (
                    <div className={(!enabled && 'disabled ') + (iconClass ?? '')}>
                        <DynamicIcon type={icon} className={!enabled && 'icon-disabled'} />
                    </div>
                );
            }
        };
        return (
            <Space size="middle" className="recording-formats">
                {getFormatIcon('presentation', 'playback-presentation')}
                {getFormatIcon('podcast', 'playback-podcast')}
                {getFormatIcon('screenshare', 'DesktopOutlined', 'icon-desktop')}
                {getFormatIcon('mp4', 'mp4')}
                {getFormatIcon('reports', 'activity-reports')}
            </Space>
        );
    };
    return (
        <>
            {
                myRecording.from == "Recordings" ?
                    <Link onClick={() => showModal(myRecording.recording.formats, myRecording.recording.url)}>
                        <ShareAltOutlined />
                    </Link>
                    :
                    <Button
                        className="share-icon"
                        size="middle"
                        type="primary"
                        shape="circle"
                        icon={<ShareAltOutlined />}
                        onClick={() => showModal(myRecording.recording.formats, myRecording.recording.url)}
                    />
            }

            {isModalVisible && (
            <Modal
                className="share-modal"
                centered
                open={true}
                onOk={handleShare}
                onCancel={cancelShare}
                footer={null}
                maskClosable={false}
            >
                <Form layout="vertical" hideRequiredMark onFinish={handleShare} validateTrigger="onSubmit">
                    <Space size={38} direction="vertical" className="modal-content">
                        <div className="mt-24">{getFormatIcons(modalFormats, true)}</div>
                        <Space size="middle" className="social-medias">
                            <div className="bbbeasy-white-btn">
                                <FacebookShareButton
                                    url={myRecording.recording.url}

                                    quote={'Join us!'}
                                >
                                    <FacebookIcon size={75} round />
                                </FacebookShareButton>
                            </div>
                            <div className="bbbeasy-white-btn">
                                <TwitterShareButton
                                    url={myRecording.recording.url}
                                >
                                    <TwitterIcon size={75} round />
                                </TwitterShareButton>
                            </div>

                            <div className="bbbeasy-white-btn">
                                <LinkedinShareButton
                                    url={myRecording.recording.url}
                                    title="Create LinkedIn Share button on Website Webpages"
                                >
                                    <LinkedinIcon size={75} round />
                                </LinkedinShareButton>

                            </div>
                        </Space>
                        <Input
                            readOnly
                            defaultValue={myRecording.recording.url}
                            suffix={<CopyTextToClipBoard textToCopy={myRecording.recording.url} />}
                        />
                        <Form.Item className="modal-submit-btn">
                            <Button type="primary" id="submit-btn" onClick={() => {window.open(myRecording.recording.url)}} htmlType="submit" block>
                                <Trans i18nKey="replay" />
                            </Button>
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
            )}
        </>
    );
}
export default ModalSocialLinks;