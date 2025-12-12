
import {
    EditButton,
    ShowButton,
    DeleteButton,
} from "@refinedev/antd";
import { Table, Space } from "antd";
import type { BaseRecord } from "@refinedev/core";
import { ITiptapExample } from "../../interfaces";
import { SmartList } from "@cundi/refine-xaf";

export const TiptapExampleList = () => {
    return (
        <SmartList<ITiptapExample> searchFields={["Name", "Content"]}>
            <Table.Column
                dataIndex="Name"
                title="Name"
                sorter
                // @ts-ignore
                defaultVisible
            />
            <Table.Column
                dataIndex="Content"
                title="Content Preview"
                render={(value: string) => {
                    if (!value) return '-';
                    // Strip HTML tags for preview and truncate
                    const text = value.replace(/<[^>]*>?/gm, '');
                    return text.length > 50 ? `${text.substring(0, 50)}...` : text;
                }}
            />
            <Table.Column
                title="Actions"
                dataIndex="actions"
                render={(_, record: BaseRecord) => (
                    <Space>
                        <EditButton hideText size="small" recordItemId={record.Oid} />
                        <ShowButton hideText size="small" recordItemId={record.Oid} />
                        <DeleteButton hideText size="small" recordItemId={record.Oid} />
                    </Space>
                )}
            />
        </SmartList>
    );
};
