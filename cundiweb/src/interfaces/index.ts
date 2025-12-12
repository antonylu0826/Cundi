

export interface IDataTypeExample {
    Oid: string;
    Name: string;
    MemoValue?: string;
    IntValue: number;
    DoubleValue: number;
    DecimalValue: number;
    DateTimeValue?: string;
    TimeSpanValue?: string;
    BoolValue: boolean;
    EnumValue: ExampleEnum;
    ImageValue?: string; // Byte array is often serialized to base64 string
    Details?: IDataTypeExampleDetail[];
}

export interface IDataTypeExampleDetail {
    Oid: string;
    DetailName: string;
    Master?: IDataTypeExample;
}

export enum ExampleEnum {
    OptionA = "OptionA",
    OptionB = "OptionB",
    OptionC = "OptionC",
}


export interface ITiptapExample {
    Oid: string;
    Name: string;
    Content?: string;
}
