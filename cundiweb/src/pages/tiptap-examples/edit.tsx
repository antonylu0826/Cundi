
import { Edit, useForm, Create } from "@refinedev/antd";
import { Form, Input } from "antd";
import { ITiptapExample } from "../../interfaces";
import { TiptapEditor } from "@cundi/refine-xaf";

export const TiptapExampleEdit = () => {
    const { formProps, saveButtonProps } = useForm<ITiptapExample>();

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Name"
                    name={["Name"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Content"
                    name={["Content"]}
                    trigger="onChange"
                    getValueFromEvent={(value) => value}
                >
                    <TiptapEditor />
                </Form.Item>
            </Form>
        </Edit>
    );
};

export const TiptapExampleCreate = () => {
    const { formProps, saveButtonProps } = useForm<ITiptapExample>();

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Name"
                    name={["Name"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Content"
                    name={["Content"]}
                    trigger="onChange"
                    getValueFromEvent={(value) => value}
                >
                    <TiptapEditor />
                </Form.Item>
            </Form>
        </Create>
    );
};
