import { LoginPage } from "./pages/login";
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
import { authProvider } from "./authProvider";
import { dataProvider } from "./odataProvider";
import {
  DemoObjectList,
  DemoObjectCreate,
  DemoObjectEdit,
  DemoObjectShow,
} from "./pages/demo-objects";

import {
  ApplicationUserList,
  ApplicationUserCreate,
  ApplicationUserEdit,
} from "./pages/application-users";

import { Header } from "./components/header";
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
                name: "DemoObject",
                list: "/DemoObjects",
                create: "/DemoObjects/create",
                edit: "/DemoObjects/edit/:id",
                show: "/DemoObjects/show/:id",
                meta: {
                  label: "Demo Objects",
                  icon: <AppstoreOutlined />,
                },
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
                name: "DemoDetail",
                list: "/DemoDetails",
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
                <Route path="/DemoObjects">
                  <Route index element={<DemoObjectList />} />
                  <Route path="create" element={<DemoObjectCreate />} />
                  <Route path="edit/:id" element={<DemoObjectEdit />} />
                  <Route path="show/:id" element={<DemoObjectShow />} />
                </Route>

                <Route path="/ApplicationUsers">
                  <Route index element={<ApplicationUserList />} />
                  <Route path="create" element={<ApplicationUserCreate />} />
                  <Route path="edit/:id" element={<ApplicationUserEdit />} />
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
