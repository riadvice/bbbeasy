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

import React, { useState } from 'react';
import { Trans } from 'react-i18next';

import { Tooltip } from 'antd';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';

import { CopyToClipboard } from 'react-copy-to-clipboard';

type Props = {
    textToCopy: string;
};

const CopyTextToClipBoard = (props: Props) => {
    const [copied, setCopied] = useState<boolean>(false);

    const copyClipboard = () => {
        setCopied(true);
        setTimeout(
            function () {
                setCopied(false);
            }.bind(this),
            5000
        );
    };

    return copied ? (
        <Tooltip title={<Trans i18nKey="copied" />}>
            <CheckOutlined className="text-success" />
        </Tooltip>
    ) : (
        <Tooltip title={<Trans i18nKey="copy_text" />}>
            <CopyToClipboard text={props.textToCopy} onCopy={copyClipboard}>
                <CopyOutlined />
            </CopyToClipboard>
        </Tooltip>
    );
};

export default CopyTextToClipBoard;
