
// Core Interfaces for XAF-Refine Integration

export interface IApplicationUser {
    Oid: string;
    UserName: string;
    DisplayName: string;
    Email: string;
    Photo?: string;
    IsActive: boolean;
    AccessFailedCount: number;
    LockoutEnd?: string;
    // Extended properties
    Roles?: IPermissionPolicyRole[];
}

export enum SecurityPermissionPolicy {
    DenyAllByDefault = "DenyAllByDefault",
    ReadOnlyAllByDefault = "ReadOnlyAllByDefault",
    AllowAllByDefault = "AllowAllByDefault",
}

export enum SecurityPermissionState {
    Allow = "Allow",
    Deny = "Deny",
}

export interface IPermissionPolicyTypePermissionObject {
    Oid?: string;
    TargetType: string;
    ReadState?: SecurityPermissionState;
    WriteState?: SecurityPermissionState;
    CreateState?: SecurityPermissionState;
    DeleteState?: SecurityPermissionState;
    NavigateState?: SecurityPermissionState;
}

export interface IPermissionPolicyRole {
    Oid: string;
    Name: string;
    IsAdministrative: boolean;
    PermissionPolicy: SecurityPermissionPolicy;
    TypePermissions?: IPermissionPolicyTypePermissionObject[];
}
