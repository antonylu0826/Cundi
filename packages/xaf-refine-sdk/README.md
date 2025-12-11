# @cundi/xaf-refine-sdk

這是一個整合 XAF 後端與 Refine 前端的 SDK，包含了身分驗證 (Auth Provider)、資料存取 (Data Provider) 的核心邏輯，以及完整的 UI 元件庫。

## 功能特色

- **Auth Provider**: 處理登入、登出、Token 管理、權限檢查。
- **Data Provider**: 專為 XAF OData 設計的資料存取層。
- **UI Components**:
    - `Header`: 包含使用者選單、主題切換 (Dark/Light Mode) 的應用程式標頭。
    - `LoginPage`: 標準登入頁面。
    - `SharedList`, `SharedDetailList`: 高度封裝的通用列表與詳情元件。
    - `ApplicationUser`: 完整的使用者管理 (列表、新增、編輯、角色分配)。
    - `PermissionPolicyRole`: 完整的角色與權限管理。

## 如何在新專案中使用

### 1. 初始化專案

建議使用官方工具建立標準 Refine + Vite + Ant Design 專案：

```bash
npm create refine-app@latest my-project
# 選項建議：
# Backend: Custom JSON REST (稍後會換掉)
# UI Framework: Ant Design
# Authentication: None (稍後使用 SDK)
```

### 2. 安裝 SDK

在您的專案目錄下安裝此 SDK：

```bash
# 若與 packages 資料夾在同一層級 (monorepo 結構)
npm install ../packages/xaf-refine-sdk

# 或使用發佈後的套件名稱
# npm install @cundi/xaf-refine-sdk
```

### 3. 設定環境變數 (.env)

在專案根目錄建立 `.env` 檔案，指定後端 API 位置。

> **注意**：SDK 的 `httpClient` (用於 Auth) 預設讀取 `VITE_API_URL`。而 OData 端點通常需要加上 `/odata` 後綴。

```env
VITE_API_URL=https://localhost:7087/api
```

### 4. 設定 App.tsx

將 `src/App.tsx` 修改為引用 SDK 的元件與邏輯：

```tsx
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import { Refine, Authenticated } from "@refinedev/core";
import { ThemedLayout, ErrorComponent, RefineThemes, useNotificationProvider } from "@refinedev/antd";
import routerProvider, { NavigateToResource, CatchAllNavigate, UnsavedChangesNotifier, DocumentTitleHandler } from "@refinedev/react-router";
import "@refinedev/antd/dist/reset.css";

// 1. 引入 SDK
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
} from "@cundi/xaf-refine-sdk";

// 2. 設定 API URL (Auth 用 raw URL, Data 用 /odata)
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
                        // 3. 設定 Data Provider (注意加上 /odata)
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
                                
                                {/* 4. 設定 SDK 提供的頁面 */}
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

## 開發與發佈

1. **安裝依賴**: `npm install`
2. **建置 SDK**: `npm run build`
3. **開發模式**: `npm run dev`
