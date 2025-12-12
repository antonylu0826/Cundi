import React from "react";
import { Form, Input } from "antd";

export const DemoDetailFormFields: React.FC<{ mode: "create" | "edit" }> = ({ mode }) => {
    return (
        <>
            <Form.Item
                label="Detail Name"
                name="DetailName"
                rules={[{ required: true }]}
            >
                <Input data-testid={`detail-name-input-${mode}`} />
            </Form.Item>
        </>
    );
};
