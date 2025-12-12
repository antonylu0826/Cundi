
import {
  Refine,
  Authenticated,
} from "@refinedev/core";
import {
  useNotificationProvider,
  ThemedLayout,
  ErrorComponent,
  RefineThemes,
} from "@refinedev/antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  FunctionOutlined,
} from "@ant-design/icons";

import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import { App as AntdApp, ConfigProvider, theme } from "antd";

import "@ant-design/v5-patch-for-react-19";
import "@refinedev/antd/dist/reset.css";

import { DashboardPage } from "../src/pages/dashboard";
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
} from "@cundi/xaf-refine-sdk";

import {
  DataTypeExampleList,
  DataTypeExampleCreate,
  DataTypeExampleEdit,
  DataTypeExampleShow,
} from "./pages/data-type-examples";
import {
  TiptapExampleList,
  TiptapExampleCreate,
  TiptapExampleEdit,
  TiptapExampleShow,
} from "./pages/tiptap-examples";
import { ColorModeContextProvider, useColorMode } from "./contexts/color-mode";

import { accessControlProvider } from "./accessControlProvider";

const API_URL = import.meta.env.VITE_API_URL + "/odata";

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
            accessControlProvider={accessControlProvider}
            dataProvider={dataProvider(API_URL)}
            routerProvider={routerProvider}
            resources={[
              {
                name: "dashboard",
                list: "/",
                meta: {
                  label: "Dashboard",
                  icon: <DashboardOutlined />,
                },
              },
              {
                name: "DataTypeExample",
                list: "/DataTypeExamples",
                create: "/DataTypeExamples/create",
                edit: "/DataTypeExamples/edit/:id",
                show: "/DataTypeExamples/show/:id",
                meta: {
                  label: "Data Type Examples",
                  icon: <AppstoreOutlined />,
                },
              },
              {
                name: "TiptapExample",
                list: "/TiptapExamples",
                create: "/TiptapExamples/create",
                edit: "/TiptapExamples/edit/:id",
                show: "/TiptapExamples/show/:id",
                meta: {
                  label: "Tiptap Examples",
                  icon: <FunctionOutlined />
                }
              },

              {
                name: "ApplicationUser",
                list: "/ApplicationUsers",
                create: "/ApplicationUsers/create",
                edit: "/ApplicationUsers/edit/:id",
                meta: {
                  label: "Users",
                  icon: <UserOutlined />,
                  parent: "Settings",
                },
              },

              {
                name: "PermissionPolicyRole",
                list: "/PermissionPolicyRoles",
                create: "/PermissionPolicyRoles/create",
                edit: "/PermissionPolicyRoles/edit/:id",
                meta: {
                  label: "Roles",
                  parent: "Settings",
                  icon: <TeamOutlined />,
                }
              },

              {
                name: "Settings",
                meta: {
                  label: "Settings",
                  icon: <SettingOutlined />,
                }
              },

              {
                name: "DataTypeExampleDetail",
                list: "/DataTypeExampleDetails",
                meta: {
                  hide: true
                }
              },
            ]}
            notificationProvider={useNotificationProvider}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated
                    key="authenticated-routes"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <ThemedLayout Header={Header}>
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="/DataTypeExamples">
                  <Route index element={<DataTypeExampleList />} />
                  <Route path="create" element={<DataTypeExampleCreate />} />
                  <Route path="edit/:id" element={<DataTypeExampleEdit />} />
                  <Route path="show/:id" element={<DataTypeExampleShow />} />
                </Route>

                <Route path="/TiptapExamples">
                  <Route index element={<TiptapExampleList />} />
                  <Route path="create" element={<TiptapExampleCreate />} />
                  <Route path="edit/:id" element={<TiptapExampleEdit />} />
                  <Route path="show/:id" element={<TiptapExampleShow />} />
                </Route>

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
                <Route
                  path="/login"
                  element={
                    <LoginPage />
                  }
                />
              </Route>

              <Route
                element={
                  <Authenticated key="catch-all">
                    <ThemedLayout Header={Header}>
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route path="*" element={<ErrorComponent />} />
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
