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

import React from 'react';
import { Trans } from 'react-i18next';

import { Button, Form, Input, Modal, Space, Typography } from 'antd';
import { ShareAltOutlined } from '@ant-design/icons';
import {
    FacebookIcon,
    FacebookShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    TwitterShareButton,
} from 'react-share';

import CopyTextToClipBoard from './CopyTextToClipBoard';
import DynamicIcon from './DynamicIcon';
import RecordingFormatIcons from './RecordingFormatIcons';

import { RecordingType } from '../types/RecordingType';

const { Link } = Typography;

type Props = {
    recording: RecordingType;

    /** The recordings table opens the dialog from a link, a room card from a button. */
    trigger?: 'link' | 'button';
};

/**
 * Shares the playback link of one recording. Both recording listings open the same
 * dialog, they only differ in what opens it.
 */
const ModalSocialLinks = ({ recording, trigger = 'link' }: Props) => {
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const url = recording.url;

    return (
        <>
            {'link' === trigger ? (
                <Link onClick={() => setIsModalVisible(true)}>
                    <ShareAltOutlined />
                </Link>
            ) : (
                <Button
                    className="share-icon"
                    size="middle"
                    type="primary"
                    shape="circle"
                    icon={<ShareAltOutlined />}
                    onClick={() => setIsModalVisible(true)}
                />
            )}

            <Modal
                className="share-modal"
                centered
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                maskClosable={false}
            >
                <Form layout="vertical" requiredMark={false}>
                    <Space size={38} direction="vertical" className="modal-content">
                        <div className="mt-24">
                            <RecordingFormatIcons formats={recording.formats} showDisabled />
                        </div>
                        <Space size="middle" className="social-medias">
                            <div className="bbbeasy-white-btn">
                                <FacebookShareButton url={url}>
                                    <FacebookIcon size={75} round />
                                </FacebookShareButton>
                            </div>
                            <div className="bbbeasy-white-btn">
                                <TwitterShareButton url={url}>
                                    {/* react-share still draws the bird, X is the mark the platform uses now. */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="75" height="75">
                                        <rect x="2" y="2" width="56" height="56" rx="30" fill="#000000" />
                                        <path
                                            d="M17 15h8.2l7 9.7 8.1-9.7h4.4L34.2 28.6 45.4 45h-8.2l-7.9-11-9.2 11H15.7l11.8-14.1L17 15z"
                                            fill="#ffffff"
                                        />
                                    </svg>
                                </TwitterShareButton>
                            </div>
                            <div className="bbbeasy-white-btn">
                                <LinkedinShareButton url={url} title="Create LinkedIn Share button on Website Webpages">
                                    <LinkedinIcon size={75} round />
                                </LinkedinShareButton>
                            </div>
                        </Space>
                        <Input readOnly value={url} suffix={<CopyTextToClipBoard textToCopy={url} />} />
                        <Form.Item className="modal-submit-btn">
                            <Button
                                type="primary"
                                id="submit-btn"
                                icon={<DynamicIcon type="playback-presentation" className="bbbeasy-ppt" />}
                                onClick={() => window.open(url)}
                                block
                            >
                                <span>
                                    <Trans i18nKey="replay" />
                                </span>
                            </Button>
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
        </>
    );
};

export default ModalSocialLinks;
