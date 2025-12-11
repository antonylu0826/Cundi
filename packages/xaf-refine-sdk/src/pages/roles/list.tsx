
import React from "react";
import { IResourceComponentsProps, BaseRecord } from "@refinedev/core";
import { useTable, List, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Checkbox } from "antd";

export const RoleList: React.FC<IResourceComponentsProps> = () => {
    const { tableProps } = useTable({
        syncWithLocation: true,
    });

    return (
        <List>
            <Table {...tableProps} rowKey="Oid">
                <Table.Column dataIndex="Name" title="Name" />
                <Table.Column
                    dataIndex="IsAdministrative"
                    title="Is Administrative"
                    render={(value: boolean) => <Checkbox checked={value} disabled />}
                />
                <Table.Column dataIndex="PermissionPolicy" title="Permission Policy" />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <EditButton hideText size="small" recordItemId={record.Oid} />
                            <DeleteButton hideText size="small" recordItemId={record.Oid} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
