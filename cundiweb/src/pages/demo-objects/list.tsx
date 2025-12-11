import {
    EditButton,
    ShowButton,
    DeleteButton,
    DateField,
} from "@refinedev/antd";
import { Table, Space, Checkbox } from "antd";
import type { BaseRecord } from "@refinedev/core";
import { IDemoObject } from "../../interfaces";
import { SmartList } from "@cundi/xaf-refine-sdk";

export const DemoObjectList = () => {
    return (
        <SmartList<IDemoObject> searchFields={["Name", "StringValue"]}>
            <Table.Column
                dataIndex="Name"
                title="Name"
                sorter
                // @ts-ignore
                defaultVisible
            />
            <Table.Column
                dataIndex="StringValue"
                title="String Value"
                sorter
            />
            <Table.Column
                dataIndex="IntValue"
                title="Int Value"
                sorter
            />
            <Table.Column
                dataIndex="EnumValue"
                title="Enum Value"
                sorter
            />
            <Table.Column
                dataIndex="DateTimeValue"
                title="DateTime Value"
                sorter
                render={(value) => <DateField value={value} format="YYYY-MM-DD" />}
            />
            <Table.Column
                dataIndex="DecimalValue"
                title="Decimal Value"
                sorter
            />
            <Table.Column
                dataIndex="ImageValue"
                title="Image"
                render={(value: string) => (
                    value ? <img src={`data:image/png;base64,${value}`} alt="Demo" style={{ height: 50, objectFit: 'cover' }} /> : '-'
                )}
            />
            <Table.Column
                dataIndex="LongStringValue"
                title="Long String"
                render={(value: string) => value && value.length > 50 ? `${value.substring(0, 50)}...` : value}
            />
            <Table.Column
                dataIndex="BoolValue"
                title="Boolean"
                sorter
                render={(value: boolean) => <Checkbox checked={value} disabled />}
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
