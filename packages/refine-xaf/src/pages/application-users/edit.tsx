
import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Checkbox, Select, App } from "antd/lib";
import { IApplicationUser } from "../../interfaces";
import { Base64Upload } from "../../components/Base64Upload";
import { getBaseUrl } from "../../utils/httpClient"; // Use SDK's getBaseUrl

export const ApplicationUserEdit: React.FC<IResourceComponentsProps> = () => {
    const { message } = App.useApp();
    const { formProps, saveButtonProps, id, form } = useForm<IApplicationUser>({
        meta: {
            expand: ["Roles"]
        },
        onMutationSuccess: async (data, variables, context) => {
            const roles = form?.getFieldValue("Roles");
            const roleIds = Array.isArray(roles)
                ? roles.map((r: any) => (r && typeof r === 'object' && 'Oid' in r) ? r.Oid : r)
                : [];

            try {
                // Use getBaseUrl to get SDK's API URL logic
                const response = await fetch(`${getBaseUrl()}/User/UpdateUserRoles`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("refine-auth")}`
                    },
                    body: JSON.stringify({
                        UserId: id,
                        RoleIds: roleIds
                    })
                });

                if (response.ok) {
                    message.success("Roles updated successfully");
                } else {
                    message.error("Failed to update roles");
                }
            } catch (e) {
                message.error("Error updating roles");
            }
        }
    });

    const { selectProps: roleSelectProps } = useSelect({
        resource: "PermissionPolicyRole",
        optionLabel: "Name",
        optionValue: "Oid",
    });

    const handleOnFinish = (values: any) => {
        const { Roles, ...userValues } = values;
        formProps.onFinish?.(userValues);
    };

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical" onFinish={handleOnFinish}>
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
                >
                    <Checkbox>Active</Checkbox>
                </Form.Item>

                <Form.Item
                    label="Roles"
                    name="Roles"
                    getValueProps={(value) => {
                        // Transform the array of role objects to array of Oids for the Select
                        // Handle both full objects (initial load) and Oids (after selection)
                        if (Array.isArray(value)) {
                            return {
                                value: value.map((r: any) => {
                                    if (r && typeof r === 'object' && 'Oid' in r) {
                                        return r.Oid;
                                    }
                                    return r;
                                })
                            };
                        }
                        return { value: [] };
                    }}
                >
                    <Select {...roleSelectProps} mode="multiple" />
                </Form.Item>

                <Form.Item
                    label="Photo"
                    name="Photo"
                >
                    <Base64Upload />
                </Form.Item>
            </Form>
        </Edit>
    );
};
