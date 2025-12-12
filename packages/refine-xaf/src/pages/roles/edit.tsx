
import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox, Select } from "antd/lib";
import { SecurityPermissionPolicy, IPermissionPolicyTypePermissionObject } from "../../interfaces";
import { TypePermissionList } from "./TypePermissionList";

export const RoleEdit: React.FC<IResourceComponentsProps> = () => {
    const { formProps, saveButtonProps, id } = useForm();

    const handleSave = () => {
        formProps.form?.submit();
    };

    return (
        <Edit saveButtonProps={{ ...saveButtonProps, onClick: handleSave }}>
            <Form
                {...formProps}
                layout="vertical"
                onFinish={(values) => {
                    const { TypePermissions, ...rest } = values as any;
                    return formProps.onFinish && formProps.onFinish(rest);
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
                <TypePermissionList
                    masterId={id?.toString()}
                />
            </Form>
        </Edit >
    );
};
