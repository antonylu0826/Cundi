
import React from "react";
import { RelatedList } from "../../components/RelatedList";
import { Form, Select, Table } from "antd/lib";
import { useTable } from "@refinedev/antd";
import { IPermissionPolicyTypePermissionObject, SecurityPermissionState } from "../../interfaces";
import { useModelTypes } from "../../hooks/useModelTypes";

const PermissionSelect = (props: any) => (
    <Select
        {...props}
        allowClear
        options={[
            { label: "Allow", value: SecurityPermissionState.Allow },
            { label: "Deny", value: SecurityPermissionState.Deny },
        ]}
    />
);

const TypePermissionFormFields = ({ typeOptions }: { typeOptions: { label: string, value: string }[] }) => {
    return (
        <>
            <Form.Item
                label="Target Type"
                name="TargetTypeFullName"
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
        </>
    );
};

export const TypePermissionList: React.FC<{ masterId?: string }> = ({ masterId }) => {
    const { data: modelTypes } = useModelTypes();

    // Self-fetching data for independently manageable list
    const { tableProps, queryResult } = useTable<IPermissionPolicyTypePermissionObject>({
        resource: "PermissionPolicyTypePermissionObject",
        filters: {
            permanent: [
                { field: "Role/Oid", operator: "eq", value: masterId || "" }
            ]
        },
        syncWithLocation: false, // Prevent URL conflict with parent
        queryOptions: {
            enabled: !!masterId,
        },
        pagination: {
            mode: "off"
        }
    });

    const typeOptions = React.useMemo(() => modelTypes
        ?.filter(t => t.IsCreatable && !t.IsDeprecated) // Optionally filter
        .map(t => ({ label: t.Caption, value: t.Name })) || [], [modelTypes]);

    const FormFieldsWrapper = React.useMemo(() => {
        return ({ mode }: { mode: "create" | "edit" }) => (
            <TypePermissionFormFields typeOptions={typeOptions} />
        );
    }, [typeOptions]);

    // Map API fields (TargetTypeFullName) to UI fields (TargetType)
    const dataSource = React.useMemo(() => {
        return (tableProps.dataSource || []).map((p: any) => ({
            ...p,
            TargetType: p.TargetType || p.TargetTypeFullName || ""
        }));
    }, [tableProps.dataSource]);

    return (
        <RelatedList<IPermissionPolicyTypePermissionObject>
            resource="PermissionPolicyTypePermissionObject"
            masterField="Role"
            masterId={masterId}
            dataSource={dataSource}
            onMutationSuccess={() => queryResult?.refetch()}
            modalTitle="Type Permission"
            FormFields={FormFieldsWrapper}
        >
            <Table.Column
                dataIndex="TargetType"
                title="Target Type"
                render={(value) => typeOptions.find(t => t.value === value)?.label || value}
            />
            <Table.Column dataIndex="ReadState" title="Read" />
            <Table.Column dataIndex="WriteState" title="Write" />
            <Table.Column dataIndex="CreateState" title="Create" />
            <Table.Column dataIndex="DeleteState" title="Delete" />
        </RelatedList>
    );
};
