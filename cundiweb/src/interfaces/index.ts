

export interface IDemoObject {
    Oid: string;
    Name: string;
    StringValue: string;
    IntValue: number;
    EnumValue: DemoObjectEnum;
    DateTimeValue?: string;
    DecimalValue: number;
    ImageValue: string;
    LongStringValue?: string;
    BoolValue: boolean;
    TiptapValue?: string;
    DemoDetails?: IDemoDetail[];
}

export interface IDemoDetail {
    Oid: string;
    Name: string;
    Remarks?: string;
    Master?: IDemoObject;
}

export enum DemoObjectEnum {
    None = "None",
    Option1 = "Option1",
    Option2 = "Option2",
    Option3 = "Option3",
}

