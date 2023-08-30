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

import { Button, Form, Typography, Card, Modal, Switch, Alert, Tooltip } from 'antd';
import DynamicIcon from './DynamicIcon';

import LocaleService from '../services/locale.service';

import { PresetType } from '../types/PresetType';
import { SubCategoryType } from '../types/SubCategoryType';
import { getIconName } from '../types/GetIconName';
import EN_US from '../locale/en-US.json';
import { FormInstance } from 'antd/lib/form';
const { Title, Paragraph } = Typography;
const { Grid, Meta } = Card;
import { useLocation } from 'react-router-dom';
import ReactDomServer from 'react-dom/server';
type Props = {
    presets: PresetType[];
    onFinish?: (category: string, subCategories: SubCategoryType[]) => void;
    enabled?: boolean;
};
let step3: FormInstance = null;
export const Step3Form = (props: Props) => {
    const location = useLocation();
    const { presets } = props;
    const [values, setValues] = React.useState<any>();
    const enabled = props.enabled ?? true;
    const [modalTitle, setModalTitle] = React.useState<string>('');
    const [modalTitleTrans, setModalTitleTrans] = React.useState<string>('');
    const [modalContent, setModalContent] = React.useState<SubCategoryType[]>([]);
    const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
    const showModal = (title: string, titleTrans: string, content: SubCategoryType[]) => {
        setIsModalVisible(true);
        setModalTitle(title);
        setModalTitleTrans(titleTrans);

        setModalContent(content);
        const formvalues = [];
        content.forEach((item) => {
            formvalues[item.name] = item.enabled;
        });
        setValues(formvalues);
    };

    const Confirm = () => {
        modalContent.map((item) => {
            item.enabled = values[item.name];
        });

        if (location.pathname.includes('settings')) {
            props.onFinish(modalTitle, modalContent);
        }
        setIsModalVisible(false);
    };

    const Cancel = () => {
        modalContent.map((item) => {
            step3.setFieldValue(item.name, item.enabled);
        });

        setIsModalVisible(false);
    };
    return (
        <div className="step3">
            <Paragraph className="final-form-header">
                <Title level={4} className="final-form-header">
                    <Trans i18nKey="bigbluebutton_rooms_settings" />
                </Title>

                <Alert
                    className="settings-info"
                    message={<Trans i18nKey="customize_configuration" />}
                    type="warning"
                    closeText={<Trans i18nKey="understand" />}
                />
            </Paragraph>
            <Card bordered={false}>
                {presets.map((item) => {
                    const filteredElements = Object.keys(EN_US).filter((elem) => EN_US[elem] == item.name);
                    const category = filteredElements.length != 0 ? filteredElements[0] : item.name;

                    return (
                        <Tooltip
                            key={item.name}
                            placement={LocaleService.direction == 'rtl' ? 'leftTop' : 'rightTop'}
                            overlayClassName="install-tooltip"
                            title={
                                <ul>
                                    {item.subcategories.map((subItem) => {
                                        const subcategory = subItem.name;

                                        return (
                                            <li
                                                key={item.name + '_' + subItem.name}
                                                className={subItem.enabled == true ? 'text-black' : 'text-grey'}
                                            >
                                                <Trans i18nKey={subcategory} />
                                            </li>
                                        );
                                    })}
                                </ul>
                            }
                        >
                            <Grid
                                key={item.name}
                                className="presets-grid"
                                onClick={() => (enabled ? showModal(item.name, category, item.subcategories) : null)}
                            >
                                <Meta
                                    avatar={<DynamicIcon type={getIconName(item.name)} className="PresetIcon" />}
                                    title={<Trans i18nKey={category} />}
                                />
                            </Grid>
                        </Tooltip>
                    );
                })}

                {enabled && (
                    <Modal
                        title={<Trans i18nKey={modalTitleTrans} />}
                        className="presets-modal"
                        centered
                        open={isModalVisible}
                        onOk={() => setIsModalVisible(false)}
                        onCancel={() => Cancel()}
                        footer={[
                            <Form.Item key="footer" className="button-container">
                                <Button className="cancel-btn prev" key="reset" onClick={Cancel}>
                                    <Trans i18nKey="cancel" />
                                </Button>
                                <Button key="submit" type="primary" htmlType="submit" onClick={Confirm}>
                                    <Trans i18nKey="confirm" />
                                </Button>
                            </Form.Item>,
                        ]}
                        maskClosable={true}
                    >
                        <Form ref={(form) => (step3 = form)}>
                            <div className="presets-body">
                                {modalContent.map((item) => {
                                    return (
                                        <div key={modalTitle + '_' + item.name}>
                                            <Form.Item
                                                label={
                                                    item.name.length > 30 ? (
                                                        <div className="white-space">
                                                            <Trans i18nKey={item.name} />
                                                        </div>
                                                    ) : (
                                                        <Trans i18nKey={item.name} />
                                                    )
                                                }
                                                valuePropName="checked"
                                                name={item.name}
                                            >
                                                <>
                                                    <input
                                                        className="input-status-presets"
                                                        disabled
                                                        type="text"
                                                        id={item.name}
                                                        value={
                                                            item.enabled == true
                                                                ? ReactDomServer.renderToString(
                                                                      <Trans i18nKey="status_presets_active" />
                                                                  )
                                                                : ReactDomServer.renderToString(
                                                                      <Trans i18nKey="status_presets_inactive" />
                                                                  )
                                                        }
                                                    />
                                                    <Switch
                                                        defaultChecked={item.enabled}
                                                        onChange={(checked) => {
                                                            const formValues = values;
                                                            formValues[item.name] = checked;

                                                            setValues(formValues);
                                                            if (checked) {
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
                                            </Form.Item>
                                        </div>
                                    );
                                })}
                            </div>
                        </Form>
                    </Modal>
                )}
            </Card>
        </div>
    );
};
