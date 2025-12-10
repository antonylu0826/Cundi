import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, DatePicker, Upload, Switch } from "antd";
import { IDemoObject, DemoObjectEnum } from "../../interfaces";
import dayjs from "dayjs";

const Base64Upload = ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => {
    return (
        <Upload
            listType="picture-card"
            maxCount={1}
            showUploadList={false}
            beforeUpload={(file) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const base64 = reader.result as string;
                    // remove data:image/png;base64, prefix if needed, but usually for display/storage keep it or strip it.
                    // For simpler testing, let's keep the full data url or strip it. 
                    // OData byte[] deserialization usually expects raw base64 string without header for `FromBase64String`.
                    // Let's strip the header.
                    const rawBase64 = base64.split(",")[1];
                    onChange?.(rawBase64);
                };
                return false;
            }}
        >
            {value ? <img src={`data:image/png;base64,${value}`} alt="avatar" style={{ width: '100%' }} /> : (
                <div>
                    <div style={{ marginTop: 8 }}>Upload</div>
                </div>
            )}
        </Upload>
    );
};

export const DemoObjectCreate = () => {
    const { formProps, saveButtonProps } = useForm<IDemoObject>();

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Name"
                    name={["Name"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="String Value"
                    name={["StringValue"]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Int Value"
                    name={["IntValue"]}
                >
                    <InputNumber />
                </Form.Item>
                <Form.Item
                    label="Enum Value"
                    name={["EnumValue"]}
                >
                    <Select
                        options={[
                            { value: DemoObjectEnum.None, label: "None" },
                            { value: DemoObjectEnum.Option1, label: "Option1" },
                            { value: DemoObjectEnum.Option2, label: "Option2" },
                            { value: DemoObjectEnum.Option3, label: "Option3" },
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label="Decimal Value"
                    name={["DecimalValue"]}
                >
                    <InputNumber step={0.01} />
                </Form.Item>
                <Form.Item
                    label="Image"
                    name={["ImageValue"]}
                >
                    <Base64Upload />
                </Form.Item>
                <Form.Item
                    label="Long String"
                    name={["LongStringValue"]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item
                    label="Boolean Value"
                    name={["BoolValue"]}
                    valuePropName="checked"
                    initialValue={false}
                >
                    <Switch />
                </Form.Item>
                <Form.Item
                    label="DateTime Value"
                    name={["DateTimeValue"]}
                    getValueProps={(value) => ({
                        value: value ? dayjs(value) : undefined,
                    })}
                >
                    <DatePicker />
                </Form.Item>
            </Form>
        </Create>
    );
};
