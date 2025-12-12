# @cundi/refine-xaf

This is an SDK integrating XAF backend with Refine frontend, including core logic for Authentication (Auth Provider), Data Access (Data Provider), and a complete UI component library.

## Features

- **Auth Provider**: Handles login, logout, Token management, and permission checks.
- **Data Provider**: Data access layer designed specifically for XAF OData.
- **UI Components**:
    - `Header`: Application header including user menu and theme toggle (Dark/Light Mode).
    - `LoginPage`: Standard login page.
    - `SmartList`, `RelatedList`: Highly encapsulated generic list and detail components.
    - `TiptapEditor`: Rich text editor with support for Images, Tables, Tasks, Math (LaTeX), YouTube, Emoji, Highlight, and Text Color.
    - `ApplicationUser`: Complete user management (List, Create, Edit, Role Assignment).
    - `PermissionPolicyRole`: Complete role and permission management.

## How to use in a new project

### 1. Initialize Project

It is recommended to use the official tool to create a standard Refine + Vite + Ant Design project:

```bash
npm create refine-app@latest my-project
# Recommended options:
# Backend: Custom JSON REST (will be replaced later)
# UI Framework: Ant Design
# Authentication: None (will use SDK later)
```

### 2. Install SDK

Install this SDK in your project directory:

```bash
# If in the same level as packages folder (monorepo structure)
npm install ../packages/refine-xaf

# Or use the published package name
# npm install @cundi/refine-xaf
```

### 3. Setup Environment Variables (.env)

Create a `.env` file in the project root directory and specify the backend API location.

> **Note**: SDK's `httpClient` (used for Auth) defaults to reading `VITE_API_URL`. OData endpoints usually need the `/odata` suffix.

```env
VITE_API_URL=https://localhost:7087/api
```

### 4. Setup App.tsx

Modify `src/App.tsx` to import components and logic from the SDK:

```tsx
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import { Refine, Authenticated } from "@refinedev/core";
import { ThemedLayout, ErrorComponent, RefineThemes, useNotificationProvider } from "@refinedev/antd";
import routerProvider, { NavigateToResource, CatchAllNavigate, UnsavedChangesNotifier, DocumentTitleHandler } from "@refinedev/react-router";
import "@refinedev/antd/dist/reset.css";

// 1. Import SDK
import {
    authProvider,
    dataProvider,
    Header,
    LoginPage,
    ApplicationUserList,
    ApplicationUserCreate,
    ApplicationUserEdit,
    RoleList,
    RoleCreate,
    RoleEdit,
    ColorModeContextProvider,
    useColorMode
} from "@cundi/refine-xaf";

// 2. Setup API URL (Raw URL for Auth, /odata for Data)
const API_URL = import.meta.env.VITE_API_URL;

const InnerApp: React.FC = () => {
    const { mode } = useColorMode();

    return (
        <BrowserRouter>
            <ConfigProvider
                theme={{
                    ...RefineThemes.Blue,
                    algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
                }}
            >
                <AntdApp>
                    <Refine
                        authProvider={authProvider}
                        // 3. Setup Data Provider (Note the /odata suffix)
                        dataProvider={dataProvider(API_URL + "/odata")}
                        routerProvider={routerProvider}
                        notificationProvider={useNotificationProvider}
                        resources={[
                            {
                                name: "dashboard",
                                list: "/",
                                meta: { label: "Dashboard" }
                            },
                            {
                                name: "ApplicationUser",
                                list: "/ApplicationUsers",
                                create: "/ApplicationUsers/create",
                                edit: "/ApplicationUsers/edit/:id",
                                meta: { label: "Users" }
                            },
                            {
                                name: "PermissionPolicyRole",
                                list: "/PermissionPolicyRoles",
                                create: "/PermissionPolicyRoles/create",
                                edit: "/PermissionPolicyRoles/edit/:id",
                                meta: { label: "Roles" }
                            }
                        ]}
                    >
                        <Routes>
                            <Route
                                element={
                                    <Authenticated key="authenticated-routes" fallback={<CatchAllNavigate to="/login" />}>
                                        <ThemedLayout Header={Header}>
                                            <Outlet />
                                        </ThemedLayout>
                                    </Authenticated>
                                }
                            >
                                <Route index element={<div>Welcome to Dashboard</div>} />
                                
                                {/* 4. Setup pages provided by SDK */}
                                <Route path="/ApplicationUsers">
                                    <Route index element={<ApplicationUserList />} />
                                    <Route path="create" element={<ApplicationUserCreate />} />
                                    <Route path="edit/:id" element={<ApplicationUserEdit />} />
                                </Route>

                                <Route path="/PermissionPolicyRoles">
                                    <Route index element={<RoleList />} />
                                    <Route path="create" element={<RoleCreate />} />
                                    <Route path="edit/:id" element={<RoleEdit />} />
                                </Route>
                            </Route>

                            <Route
                                element={
                                    <Authenticated key="auth-pages" fallback={<Outlet />}>
                                        <NavigateToResource resource="dashboard" />
                                    </Authenticated>
                                }
                            >
                                <Route path="/login" element={<LoginPage />} />
                            </Route>
                        </Routes>
                        <UnsavedChangesNotifier />
                        <DocumentTitleHandler />
                    </Refine>
                </AntdApp>
            </ConfigProvider>
        </BrowserRouter>
    );
};

const App: React.FC = () => {
    return (
        <ColorModeContextProvider>
            <InnerApp />
        </ColorModeContextProvider>
    );
};

export default App;
```

## Building Custom CRUD Pages

To create CRUD pages for your own XAF business objects (e.g., `DemoObject`), follow these patterns (reference `cundiweb/src/pages/demo-objects` for complete examples).

### List Page

Use the `SmartList` component to quickly build a feature-rich list view with search capabilities.

```tsx
import { SmartList } from "@cundi/refine-xaf";
import { Table, Checkbox, Space } from "antd";
import { EditButton, ShowButton, DeleteButton, DateField } from "@refinedev/antd";

export const DemoObjectList = () => {
    return (
        // searchFields prop enables the search bar for specified columns
        <SmartList searchFields={["Name", "StringValue"]}>
            <Table.Column dataIndex="Name" title="Name" sorter defaultVisible />
            <Table.Column dataIndex="StringValue" title="String Value" sorter />
            <Table.Column 
                dataIndex="BoolValue" 
                title="Boolean" 
                render={(value) => <Checkbox checked={value} disabled />} 
            />
            {/* Standard Ant Design Table.Column configuration */}
            <Table.Column
                title="Actions"
                dataIndex="actions"
                render={(_, record) => (
                    <Space>
                        <EditButton hideText size="small" recordItemId={record.Oid} />
                        <ShowButton hideText size="small" recordItemId={record.Oid} />
                        <DeleteButton hideText size="small" recordItemId={record.Oid} />
                    </Space>
                )}
            />
        </SmartList>
    );
};
```

### Create/Edit Page

Use standard Refine hooks (`useForm`) combined with Ant Design Form components. For file uploads (like Images), use the `Base64Upload` component provided by the SDK.

```tsx
import { Create, useForm } from "@refinedev/antd"; // or Edit
import { Base64Upload } from "@cundi/refine-xaf";
import { Form, Input, Switch } from "antd";

export const DemoObjectCreate = () => {
    const { formProps, saveButtonProps } = useForm();

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label="Name"
                    name={["Name"]}
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
                
                {/* Image upload example */}
                <Form.Item label="Image" name={["ImageValue"]}>
                    <Base64Upload />
                </Form.Item>

                <Form.Item 
                    label="Active" 
                    name={["Active"]} 
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Create>
    );
};
```

## Development and Publishing

1. **Install Dependencies**: `npm install`
2. **Build SDK**: `npm run build`
3. **Development Mode**: `npm run dev`
