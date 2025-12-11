
import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox, Select } from "antd";
import { SecurityPermissionPolicy } from "../../interfaces";
import { TypePermissionList } from "./TypePermissionList";

export const RoleCreate: React.FC<IResourceComponentsProps> = () => {
    const [form] = Form.useForm();
    const { formProps, saveButtonProps } = useForm();

    const handleSave = () => {
        form.submit();
    };

    return (
        <Create saveButtonProps={{ ...saveButtonProps, onClick: handleSave }}>
            <Form
                {...formProps}
                form={form}
                layout="vertical"
                onFinish={(values) => {
                    return formProps.onFinish && formProps.onFinish(values);
                }}
            >
                <Form.Item
                    label="Name"
                    name="Name"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Is Administrative"
                    name="IsAdministrative"
                    valuePropName="checked"
                >
                    <Checkbox>Is Administrative</Checkbox>
                </Form.Item>
                <Form.Item
                    label="Permission Policy"
                    name="PermissionPolicy"
                    initialValue={SecurityPermissionPolicy.DenyAllByDefault}
                    rules={[{ required: true }]}
                >
                    <Select
                        options={[
                            { label: "Deny All By Default", value: SecurityPermissionPolicy.DenyAllByDefault },
                            { label: "Read Only All By Default", value: SecurityPermissionPolicy.ReadOnlyAllByDefault },
                            { label: "Allow All By Default", value: SecurityPermissionPolicy.AllowAllByDefault },
                        ]}
                    />
                </Form.Item>
                <TypePermissionList />
            </Form>
        </Create >
    );
};
