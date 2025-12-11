import { AuthProvider, DataProvider, BaseRecord, IResourceComponentsProps } from '@refinedev/core';
import React, { PropsWithChildren } from 'react';
import * as _tanstack_react_query from '@tanstack/react-query';

declare const authProvider: AuthProvider;

declare const dataProvider: (apiUrl: string) => DataProvider;

interface IApplicationUser {
    Oid: string;
    UserName: string;
    DisplayName: string;
    Email: string;
    Photo?: string;
    IsActive: boolean;
    AccessFailedCount: number;
    LockoutEnd?: string;
    Roles?: IPermissionPolicyRole[];
}
declare enum SecurityPermissionPolicy {
    DenyAllByDefault = "DenyAllByDefault",
    ReadOnlyAllByDefault = "ReadOnlyAllByDefault",
    AllowAllByDefault = "AllowAllByDefault"
}
declare enum SecurityPermissionState {
    Allow = "Allow",
    Deny = "Deny"
}
interface IPermissionPolicyTypePermissionObject {
    Oid?: string;
    TargetType: string;
    ReadState?: SecurityPermissionState;
    WriteState?: SecurityPermissionState;
    CreateState?: SecurityPermissionState;
    DeleteState?: SecurityPermissionState;
    NavigateState?: SecurityPermissionState;
}
interface IPermissionPolicyRole {
    Oid: string;
    Name: string;
    IsAdministrative: boolean;
    PermissionPolicy: SecurityPermissionPolicy;
    TypePermissions?: IPermissionPolicyTypePermissionObject[];
}

declare const TOKEN_KEY = "refine-auth";
declare class HttpError extends Error {
    statusCode: number;
    message: string;
    body: any;
    constructor(statusCode: number, message: string, body: any);
}
interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}
declare const getBaseUrl: () => any;
declare const httpClient: (endpoint: string, options?: RequestOptions) => Promise<Response | null>;
declare const parseJwt: (token: string) => any;

declare const authService: {
    login: ({ username, password }: any) => Promise<string>;
    getUserByUsername: (username: string) => Promise<IApplicationUser | null>;
    getUserById: (userId: string) => Promise<IApplicationUser | null>;
    resetPassword: (userId: string, newPassword: string) => Promise<boolean>;
};

declare const Header: React.FC;

interface SharedListProps {
    children?: React.ReactNode;
    resource?: string;
    searchFields?: string[];
}
declare const SharedList: <T extends BaseRecord = BaseRecord>({ children, resource, searchFields, }: SharedListProps) => React.JSX.Element;

interface SharedDetailListProps<TItem extends BaseRecord> {
    resource: string;
    /** Field name in the detail object that links to master (e.g. "Master") */
    masterField: string;
    /** ID of the master record */
    masterId?: string;
    /** Data source for the table */
    dataSource?: TItem[];
    /** Callback when data changes (save/delete) to refresh parent */
    onMutationSuccess?: () => void;
    /** Function component to render form fields. Receives 'mode' prop. */
    FormFields: React.FC<{
        mode: "create" | "edit";
    }>;
    /** Title for the modal, defaults to "Manage Detail" */
    modalTitle?: string;
    /** Extra props for the Table */
    children?: React.ReactNode;
}
declare const SharedDetailList: <TItem extends BaseRecord>({ resource, masterField, masterId, dataSource, onMutationSuccess, FormFields, modalTitle, children, }: SharedDetailListProps<TItem>) => React.JSX.Element;

interface Base64UploadProps {
    value?: string;
    onChange?: (value: string) => void;
}
declare const Base64Upload: React.FC<Base64UploadProps>;

declare const LoginPage: React.FC;

declare const ApplicationUserList: React.FC<IResourceComponentsProps>;

declare const ApplicationUserCreate: React.FC<IResourceComponentsProps>;

declare const ApplicationUserEdit: React.FC<IResourceComponentsProps>;

declare const RoleList: React.FC<IResourceComponentsProps>;

declare const RoleCreate: React.FC<IResourceComponentsProps>;

declare const RoleEdit: React.FC<IResourceComponentsProps>;

type ColorModeContextType = {
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
};
declare const ColorModeContext: React.Context<ColorModeContextType>;
declare const ColorModeContextProvider: React.FC<PropsWithChildren>;
declare const useColorMode: () => ColorModeContextType;

interface IModelType {
    Name: string;
    Caption: string;
    IsCreatable: boolean;
    IsDeprecated: boolean;
    Value?: string;
    Label?: string;
}
declare const useModelTypes: () => _tanstack_react_query.UseQueryResult<IModelType[], unknown>;

export { ApplicationUserCreate, ApplicationUserEdit, ApplicationUserList, Base64Upload, ColorModeContext, ColorModeContextProvider, Header, HttpError, type IApplicationUser, type IModelType, type IPermissionPolicyRole, type IPermissionPolicyTypePermissionObject, LoginPage, type RequestOptions, RoleCreate, RoleEdit, RoleList, SecurityPermissionPolicy, SecurityPermissionState, SharedDetailList, SharedList, TOKEN_KEY, authProvider, authService, dataProvider, getBaseUrl, httpClient, parseJwt, useColorMode, useModelTypes };
