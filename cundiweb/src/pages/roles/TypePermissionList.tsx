import React from "react";
import { Form, Select, Button, Space, Card, Row, Col, Spin } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { SecurityPermissionState } from "../../interfaces";
import { useModelTypes } from "../../hooks/useModelTypes";

const permissionStates = [
    { label: "Allow", value: SecurityPermissionState.Allow },
    { label: "Deny", value: SecurityPermissionState.Deny },
];

export const TypePermissionList: React.FC = () => {
    const { data: targetTypes, isLoading } = useModelTypes();

    if (isLoading) {
        return <Spin />;
    }

    return (
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
    );
};
