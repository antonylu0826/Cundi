import { Show, TextField, NumberField, DateField, BooleanField } from "@refinedev/antd";
import { Typography, Image, Table } from "antd";
import { IDemoObject, IDemoDetail } from "../../interfaces";
import { useShow } from "@refinedev/core";
import { RelatedList } from "@cundi/xaf-refine-sdk";
import { DemoDetailFormFields } from "../../components/demo-details/DemoDetailFormFields";

const { Title } = Typography;

export const DemoObjectShow = () => {
    const { query } = useShow<IDemoObject>({
        meta: {
            expand: [
                {
                    field: "DemoDetails",
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

            <Title level={5}>String Value</Title>
            <TextField value={record?.StringValue} />

            <Title level={5}>Int Value</Title>
            <NumberField value={record?.IntValue ?? ""} />

            <Title level={5}>Decimal Value</Title>
            <NumberField value={record?.DecimalValue ?? ""} />

            <Title level={5}>Boolean Value</Title>
            <BooleanField value={record?.BoolValue} />

            <Title level={5}>Date Time</Title>
            <DateField value={record?.DateTimeValue} format="YYYY-MM-DD" />

            <Title level={5}>Image</Title>
            {record?.ImageValue ? (
                <Image src={`data:image/png;base64,${record?.ImageValue}`} width={200} />
            ) : (
                <TextField value="-" />
            )}

            <Title level={5}>Long String</Title>
            <TextField value={record?.LongStringValue} />

            <Title level={5}>Tiptap Content</Title>
            <div dangerouslySetInnerHTML={{ __html: record?.TiptapValue ?? "" }} />

            <div style={{ marginTop: 24, marginBottom: 8 }}>
                <Title level={4} style={{ margin: 0, marginBottom: 16 }}>Demo Details</Title>

                <RelatedList<IDemoDetail>
                    resource="DemoDetail"
                    masterField="Master"
                    masterId={record?.Oid}
                    dataSource={record?.DemoDetails}
                    onMutationSuccess={() => query.refetch()}
                    FormFields={DemoDetailFormFields}
                    modalTitle="Manage Demo Detail"
                >
                    <Table.Column title="Name" dataIndex="Name" />
                    <Table.Column title="Remarks" dataIndex="Remarks" />
                </RelatedList>
            </div>
        </Show>
    );
};
