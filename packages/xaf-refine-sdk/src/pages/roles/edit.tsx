
import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox, Select } from "antd";
import { SecurityPermissionPolicy, IPermissionPolicyTypePermissionObject } from "../../interfaces";
import { TypePermissionList } from "./TypePermissionList";

export const RoleEdit: React.FC<IResourceComponentsProps> = () => {
    const [form] = Form.useForm();
    const { formProps, saveButtonProps } = useForm({
        meta: {
            expand: [
                { field: "TypePermissions" }
            ]
        }
    });

    const handleSave = () => {
        form.submit();
    };

    React.useEffect(() => {
        if (formProps.initialValues) {
            const values = { ...formProps.initialValues };

            // Map TargetTypeFullName from OData to TargetType for the form
            if (values.TypePermissions) {
                values.TypePermissions = values.TypePermissions.map((p: IPermissionPolicyTypePermissionObject & { TargetTypeFullName?: string }) => ({
                    ...p,
                    TargetType: p.TargetType || p.TargetTypeFullName || ""
                }));
            }

            form.setFieldsValue(values);
        }
    }, [formProps.initialValues]);

    return (
        <Edit saveButtonProps={{ ...saveButtonProps, onClick: handleSave }}>
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
        </Edit >
    );
};
