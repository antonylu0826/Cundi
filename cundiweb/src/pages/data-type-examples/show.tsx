import { Show, TextField, NumberField, DateField, BooleanField } from "@refinedev/antd";
import { Typography, Image, Table } from "antd";
import { IDataTypeExample, IDataTypeExampleDetail } from "../../interfaces";
import { useShow } from "@refinedev/core";
import { RelatedList } from "@cundi/xaf-refine-sdk";
import { DemoDetailFormFields } from "../../components/demo-details/DemoDetailFormFields";

const { Title } = Typography;

export const DataTypeExampleShow = () => {
    const { query } = useShow<IDataTypeExample>({
        meta: {
            expand: [
                {
                    field: "Details",
                }
            ]
        }
    });
    const { data, isLoading } = query;

    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>Name</Title>
            <TextField value={record?.Name} />

            <Title level={5}>Memo Value</Title>
            <TextField value={record?.MemoValue} />

            <Title level={5}>Int Value</Title>
            <NumberField value={record?.IntValue ?? ""} />

            <Title level={5}>Double Value</Title>
            <NumberField value={record?.DoubleValue ?? ""} />

            <Title level={5}>Decimal Value</Title>
            <NumberField value={record?.DecimalValue ?? ""} />

            <Title level={5}>Enum Value</Title>
            <TextField value={record?.EnumValue} />

            <Title level={5}>Boolean Value</Title>
            <BooleanField value={record?.BoolValue} />

            <Title level={5}>Date Time</Title>
            <DateField value={record?.DateTimeValue} format="YYYY-MM-DD HH:mm:ss" />

            <Title level={5}>TimeSpan</Title>
            <TextField value={record?.TimeSpanValue} />

            <Title level={5}>Image</Title>
            {record?.ImageValue ? (
                <Image src={`data:image/png;base64,${record?.ImageValue}`} width={200} />
            ) : (
                <TextField value="-" />
            )}

            <div style={{ marginTop: 24, marginBottom: 8 }}>
                <Title level={4} style={{ margin: 0, marginBottom: 16 }}>Details</Title>

                <RelatedList<IDataTypeExampleDetail>
                    resource="DataTypeExampleDetail"
                    masterField="Master"
                    masterId={record?.Oid}
                    dataSource={record?.Details}
                    onMutationSuccess={() => query.refetch()}
                    FormFields={DemoDetailFormFields}
                    modalTitle="Manage Detail"
                >
                    <Table.Column title="Detail Name" dataIndex="DetailName" />
                </RelatedList>
            </div>
        </Show>
    );
};
