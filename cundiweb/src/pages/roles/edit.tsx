import React from "react";
import { IResourceComponentsProps } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox, Select, Space, Card, Row, Col, Button, Spin } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
    SecurityPermissionPolicy,
    SecurityPermissionState,
    IPermissionPolicyTypePermissionObject
} from "../../interfaces";
import { useModelTypes } from "../../hooks/useModelTypes";

const permissionStates = [
    { label: "Allow", value: SecurityPermissionState.Allow },
    { label: "Deny", value: SecurityPermissionState.Deny },
];

export const RoleEdit: React.FC<IResourceComponentsProps> = () => {
    const [form] = Form.useForm();
    const { formProps, saveButtonProps } = useForm({
        meta: {
            expand: [
                { field: "TypePermissions" }
            ]
        }
    });
    const { data: targetTypes, isLoading } = useModelTypes();

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

    const handleSave = () => {
        form.submit();
    };

    return (
        <Edit saveButtonProps={{ ...saveButtonProps, onClick: handleSave }}>
            <Form
                {...formProps}
                form={form}
                layout="vertical"
                onFinish={(values) => {
                    if (formProps.onFinish) {
                        return formProps.onFinish(values);
                    }
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

                <Form.List name="TypePermissions">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card
                                    key={key}
                                    size="small"
                                    title={`Permission #${name + 1}`}
                                    extra={
                                        <MinusCircleOutlined
                                            onClick={() => remove(name)}
                                        />
                                    }
                                    style={{ marginBottom: 8 }}
                                >
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "TargetType"]}
                                            label="Target Type"
                                            rules={[{ required: true, message: "Missing target type" }]}
                                        >
                                            <Select
                                                key={isLoading ? "loading" : "loaded"}
                                                loading={isLoading}
                                                showSearch
                                                options={targetTypes?.map(t => ({ label: t.Label, value: t.Value }))}
                                                placeholder="Select Target Type"
                                                filterOption={(input, option) =>
                                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                            />
                                        </Form.Item>

                                        <Row gutter={16}>
                                            <Col span={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "ReadState"]}
                                                    label="Read"
                                                >
                                                    <Select options={permissionStates} placeholder="Select" allowClear />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "WriteState"]}
                                                    label="Write"
                                                >
                                                    <Select options={permissionStates} placeholder="Select" allowClear />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "CreateState"]}
                                                    label="Create"
                                                >
                                                    <Select options={permissionStates} placeholder="Select" allowClear />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "DeleteState"]}
                                                    label="Delete"
                                                >
                                                    <Select options={permissionStates} placeholder="Select" allowClear />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, "NavigateState"]}
                                                    label="Navigate"
                                                >
                                                    <Select options={permissionStates} placeholder="Select" allowClear />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Space>
                                </Card>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Type Permission
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Edit >
    );
};
