import { Create, useForm } from "@refinedev/antd";
import { Base64Upload } from "@cundi/refine-xaf";
import { Form, Input, InputNumber, Select, DatePicker, Switch, TimePicker } from "antd";
import { IDataTypeExample, ExampleEnum } from "../../interfaces";
import dayjs from "dayjs";

export const DataTypeExampleCreate = () => {
    const { formProps, saveButtonProps } = useForm<IDataTypeExample>();

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
                    label="Memo Value (Unlimited)"
                    name={["MemoValue"]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item
                    label="Int Value"
                    name={["IntValue"]}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    label="Double Value"
                    name={["DoubleValue"]}
                >
                    <InputNumber style={{ width: '100%' }} step={0.01} />
                </Form.Item>
                <Form.Item
                    label="Decimal Value"
                    name={["DecimalValue"]}
                >
                    <InputNumber style={{ width: '100%' }} step={0.01} />
                </Form.Item>
                <Form.Item
                    label="Enum Value"
                    name={["EnumValue"]}
                >
                    <Select
                        options={[
                            { value: ExampleEnum.OptionA, label: "OptionA" },
                            { value: ExampleEnum.OptionB, label: "OptionB" },
                            { value: ExampleEnum.OptionC, label: "OptionC" },
                        ]}
                    />
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
                    <DatePicker showTime />
                </Form.Item>
                <Form.Item
                    label="TimeSpan Value"
                    name={["TimeSpanValue"]}
                >
                    <Input placeholder="d.hh:mm:ss" />
                </Form.Item>
                <Form.Item
                    label="Image"
                    name={["ImageValue"]}
                >
                    <Base64Upload />
                </Form.Item>
            </Form>
        </Create>
    );
};
