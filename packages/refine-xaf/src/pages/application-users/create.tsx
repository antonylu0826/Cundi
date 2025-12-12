
import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox } from "antd/lib";
import { IApplicationUser } from "../../interfaces";
import { Base64Upload } from "../../components/Base64Upload";

export const ApplicationUserCreate: React.FC<IResourceComponentsProps> = () => {
    const { formProps, saveButtonProps } = useForm<IApplicationUser>();

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="User Name"
                    name="UserName"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Display Name"
                    name="DisplayName"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Email"
                    name="Email"
                    rules={[
                        {
                            type: "email",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Is Active"
                    name="IsActive"
                    valuePropName="checked"
                    initialValue={true}
                >
                    <Checkbox>Active</Checkbox>
                </Form.Item>
                <Form.Item
                    label="Photo"
                    name="Photo"
                >
                    <Base64Upload />
                </Form.Item>
            </Form>
        </Create>
    );
};
