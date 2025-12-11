import { Edit, useForm } from "@refinedev/antd";
import { Base64Upload } from "@cundi/xaf-refine-sdk";
import { Form, Input, InputNumber, Select, DatePicker, Upload, Switch } from "antd";
import { IDemoObject, DemoObjectEnum } from "../../interfaces";
import dayjs from "dayjs";



export const DemoObjectEdit = () => {
    const { formProps, saveButtonProps } = useForm<IDemoObject>();

    return (
        <Edit saveButtonProps={saveButtonProps}>
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
        </Edit>
    );
};
