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



export interface IApplicationUser {
    Oid: string;
    UserName: string;
    DisplayName: string;
    Email: string;
    Photo?: string;
    IsActive: boolean;
    AccessFailedCount: number;
    LockoutEnd?: string;
}
