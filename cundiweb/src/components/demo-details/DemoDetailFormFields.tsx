import React from "react";
import { Form, Input } from "antd";

export const DemoDetailFormFields: React.FC<{ mode: "create" | "edit" }> = ({ mode }) => {
    return (
        <>
            <Form.Item
                label="Name"
                name="Name"
                rules={[{ required: true }]}
            >
                <Input data-testid={`detail-name-input-${mode}`} />
            </Form.Item>
            <Form.Item
                label="Remarks"
                name="Remarks"
            >
                <Input.TextArea rows={4} data-testid={`detail-remarks-input-${mode}`} />
            </Form.Item>
        </>
    );
};
