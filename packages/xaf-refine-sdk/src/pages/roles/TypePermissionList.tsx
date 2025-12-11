
import React from "react";
import { RelatedList } from "../../components/RelatedList";
import { Form, Select, Table } from "antd";
import { IPermissionPolicyTypePermissionObject, SecurityPermissionState } from "../../interfaces";
import { useModelTypes } from "../../hooks/useModelTypes";

export const TypePermissionList: React.FC<{ dataSource?: IPermissionPolicyTypePermissionObject[] }> = ({ dataSource }) => {
    const { data: modelTypes } = useModelTypes();
    const typeOptions = modelTypes
        ?.filter(t => t.IsCreatable && !t.IsDeprecated) // Optionally filter
        .map(t => ({ label: t.Caption, value: t.Name })) || [];

    const PermissionSelect = () => (
        <Select
            allowClear
            options={[
                { label: "Allow", value: SecurityPermissionState.Allow },
                { label: "Deny", value: SecurityPermissionState.Deny },
            ]}
        />
    );

    return (
        <RelatedList<IPermissionPolicyTypePermissionObject>
            resource="PermissionPolicyTypePermissions"
            masterField="Role"
            dataSource={dataSource} // If provided, or parent handles it
            modalTitle="Type Permission"
            FormFields={({ mode }) => (
                <>
                    <Form.Item
                        label="Target Type"
                        name="TargetType"
                        rules={[{ required: true }]}
                    >
                        <Select
                            showSearch
                            options={typeOptions}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    <Form.Item label="Read State" name="ReadState">
                        <PermissionSelect />
                    </Form.Item>
                    <Form.Item label="Write State" name="WriteState">
                        <PermissionSelect />
                    </Form.Item>
                    <Form.Item label="Create State" name="CreateState">
                        <PermissionSelect />
                    </Form.Item>
                    <Form.Item label="Delete State" name="DeleteState">
                        <PermissionSelect />
                    </Form.Item>
                    <Form.Item label="Navigate State" name="NavigateState">
                        <PermissionSelect />
                    </Form.Item>
                </>
            )}
        >
            <Table.Column dataIndex="TargetType" title="Target Type" />
            <Table.Column dataIndex="ReadState" title="Read" />
            <Table.Column dataIndex="WriteState" title="Write" />
            <Table.Column dataIndex="CreateState" title="Create" />
            <Table.Column dataIndex="DeleteState" title="Delete" />
            <Table.Column dataIndex="NavigateState" title="Navigate" />
        </RelatedList>
    );
};
