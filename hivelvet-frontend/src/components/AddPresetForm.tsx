import { Button, Form, Input } from 'antd';
import { Trans } from 'react-i18next';
import { t } from 'i18next';
import EN_US from '../locale/en-US.json';
import {FormInstance} from "antd/lib/form";

type formType = {
    name: string;
};

type Props = {
    addForm: FormInstance;
    errors?: string[];
    handleAdd: (values: formType) => void;
    failedAdd: () => void;
    cancelAdd: () => void;
};

export const AddPresetForm = (props: Props) => {
    const { errors, handleAdd, failedAdd, cancelAdd } = props;
    let { addForm } = props;

    return (
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
                {...('name' in errors && {
                    help: (
                        <Trans
                            i18nKey={Object.keys(EN_US).filter((elem) => EN_US[elem] == errors['name'])}
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
                <Input placeholder={t('name.label')} />
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
    );
}