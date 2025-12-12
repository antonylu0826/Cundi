
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Typography } from "antd";
import { ITiptapExample } from "../../interfaces";
import { TiptapEditor } from "@cundi/xaf-refine-sdk";

const { Title } = Typography;

export const TiptapExampleShow = () => {
    const { query } = useShow<ITiptapExample>();
    const { data, isLoading } = query;

    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>Name</Title>
            <Typography.Text>{record?.Name}</Typography.Text>

            <Title level={5} style={{ marginTop: 24 }}>Content</Title>
            <TiptapEditor value={record?.Content} disabled={true} />
        </Show>
    );
};
