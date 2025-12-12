import {
    EditButton,
    ShowButton,
    DeleteButton,
    DateField,
    BooleanField,
} from "@refinedev/antd";
import { Table, Space, Checkbox } from "antd";
import type { BaseRecord } from "@refinedev/core";
import { IDataTypeExample } from "../../interfaces";
import { SmartList } from "@cundi/refine-xaf";

export const DataTypeExampleList = () => {
    return (
        <SmartList<IDataTypeExample> searchFields={["Name", "MemoValue"]}>
            <Table.Column
                dataIndex="Name"
                title="Name"
                sorter
                // @ts-ignore
                defaultVisible
            />
            <Table.Column
                dataIndex="MemoValue"
                title="Memo Value"
                sorter
                render={(value: string) => value && value.length > 50 ? `${value.substring(0, 50)}...` : value}
            />
            <Table.Column
                dataIndex="IntValue"
                title="Int Value"
                sorter
            />
            <Table.Column
                dataIndex="DoubleValue"
                title="Double Value"
                sorter
            />
            <Table.Column
                dataIndex="DecimalValue"
                title="Decimal Value"
                sorter
            />
            <Table.Column
                dataIndex="EnumValue"
                title="Enum Value"
                sorter
            />
            <Table.Column
                dataIndex="DateTimeValue"
                title="DateTime"
                sorter
                render={(value) => <DateField value={value} format="YYYY-MM-DD HH:mm" />}
            />
            <Table.Column
                dataIndex="TimeSpanValue"
                title="TimeSpan"
                sorter
            />
            <Table.Column
                dataIndex="ImageValue"
                title="Image"
                render={(value: string) => (
                    value ? <img src={`data:image/png;base64,${value}`} alt="Img" style={{ height: 50, objectFit: 'cover' }} /> : '-'
                )}
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
