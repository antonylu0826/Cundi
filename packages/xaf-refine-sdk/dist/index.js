"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ApplicationUserCreate: () => ApplicationUserCreate,
  ApplicationUserEdit: () => ApplicationUserEdit,
  ApplicationUserList: () => ApplicationUserList,
  Base64Upload: () => Base64Upload,
  ColorModeContext: () => ColorModeContext,
  ColorModeContextProvider: () => ColorModeContextProvider,
  Header: () => Header,
  HttpError: () => HttpError,
  LoginPage: () => LoginPage,
  RoleCreate: () => RoleCreate,
  RoleEdit: () => RoleEdit,
  RoleList: () => RoleList,
  SecurityPermissionPolicy: () => SecurityPermissionPolicy,
  SecurityPermissionState: () => SecurityPermissionState,
  SharedDetailList: () => SharedDetailList,
  SharedList: () => SharedList,
  TOKEN_KEY: () => TOKEN_KEY,
  authProvider: () => authProvider,
  authService: () => authService,
  dataProvider: () => dataProvider,
  getBaseUrl: () => getBaseUrl,
  httpClient: () => httpClient,
  parseJwt: () => parseJwt,
  useColorMode: () => useColorMode,
  useModelTypes: () => useModelTypes
});
module.exports = __toCommonJS(index_exports);

// src/utils/httpClient.ts
var import_meta = {};
var TOKEN_KEY = "refine-auth";
var HttpError = class _HttpError extends Error {
  constructor(statusCode, message2, body) {
    super(message2);
    __publicField(this, "statusCode");
    __publicField(this, "message");
    __publicField(this, "body");
    this.statusCode = statusCode;
    this.message = message2;
    this.body = body;
    Object.setPrototypeOf(this, _HttpError.prototype);
  }
};
var getBaseUrl = () => {
  return import_meta.env?.VITE_API_URL || "";
};
var httpClient = async (endpoint, options = {}) => {
  const { skipAuth, headers, ...restOptions } = options;
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json"
  };
  if (!skipAuth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }
  const config = {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers
    }
  };
  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorBody = await response.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorBody);
      } catch {
        parsedError = errorBody;
      }
      throw new HttpError(response.status, response.statusText, parsedError);
    }
    if (response.status === 204) {
      return null;
    }
    return response;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, "Network Error", error);
  }
};
var parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(window.atob(base64).split("").map(function(c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT", e);
    return {};
  }
};

// src/services/authService.ts
var authService = {
  login: async ({ username, password }) => {
    const response = await httpClient("/Authentication/Authenticate", {
      method: "POST",
      body: JSON.stringify({ userName: username, password }),
      skipAuth: true
    });
    if (!response) {
      throw new Error("No response from login endpoint");
    }
    const token = await response.text();
    return token;
  },
  getUserByUsername: async (username) => {
    const queryUrl = `/odata/ApplicationUser?$filter=tolower(UserName) eq '${username.toLowerCase()}'&$top=1&$expand=Roles($select=Name,IsAdministrative)`;
    const response = await httpClient(queryUrl);
    if (!response) return null;
    const data = await response.json();
    return data.value && data.value.length > 0 ? data.value[0] : null;
  },
  getUserById: async (userId) => {
    const queryUrl = `/odata/ApplicationUser(${userId})?$expand=Roles($select=Name,IsAdministrative)`;
    const response = await httpClient(queryUrl);
    if (!response) return null;
    const data = await response.json();
    return data;
  },
  resetPassword: async (userId, newPassword) => {
    await httpClient("/User/ResetPassword", {
      method: "POST",
      body: JSON.stringify({
        userId,
        newPassword
      })
    });
    return true;
  }
};

// src/authProvider.ts
var authProvider = {
  login: async ({ username, password }) => {
    try {
      const token = await authService.login({ username, password });
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        const claims = parseJwt(token);
        const userId = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || claims.sub || claims.id || claims.Oid;
        const claimName = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || claims.unique_name || claims.name || username;
        try {
          let user = null;
          if (userId) {
            user = await authService.getUserById(userId);
          } else {
            user = await authService.getUserByUsername(username);
          }
          if (user) {
            if (user.Photo) {
              localStorage.setItem("user_photo", user.Photo);
            } else {
              localStorage.removeItem("user_photo");
            }
            localStorage.setItem("user_name", user.DisplayName || user.UserName || claimName);
            localStorage.setItem("user_id", user.Oid || userId);
            let isAdmin = false;
            if (user.Roles) {
              const roles = user.Roles.map((r) => r.Name);
              localStorage.setItem("user_roles", JSON.stringify(roles));
              isAdmin = user.Roles.some((r) => r.IsAdministrative);
            }
            localStorage.setItem("user_is_admin", isAdmin ? "true" : "false");
          }
        } catch (error) {
          console.error("Failed to fetch user details", error);
        }
        return {
          success: true,
          redirectTo: "/"
        };
      }
      return {
        success: false,
        error: {
          message: "Login failed",
          name: "Invalid credentials"
        }
      };
    } catch (e) {
      return {
        success: false,
        error: {
          message: "Login failed",
          name: "Network or Server Error"
        }
      };
    }
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user_photo");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_roles");
    localStorage.removeItem("user_is_admin");
    return {
      success: true,
      redirectTo: "/login"
    };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const claims = parseJwt(token);
        const exp = claims.exp;
        if (exp && Date.now() >= exp * 1e3) {
          console.warn("Token expired");
          return {
            authenticated: false,
            redirectTo: "/login",
            logout: true
          };
        }
      } catch (e) {
        console.error("Invalid token format", e);
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: true
        };
      }
      return {
        authenticated: true
      };
    }
    return {
      authenticated: false,
      redirectTo: "/login"
    };
  },
  getPermissions: async () => {
    const roles = localStorage.getItem("user_roles");
    return roles ? JSON.parse(roles) : [];
  },
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const photo = localStorage.getItem("user_photo");
    const name = localStorage.getItem("user_name") || "";
    const id = localStorage.getItem("user_id");
    if (token) {
      return {
        id: id || "1",
        name,
        avatar: photo ? `data:image/png;base64,${photo}` : "https://i.pravatar.cc/150"
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    if (error?.statusCode === 401 || error?.status === 401) {
      return {
        logout: true,
        redirectTo: "/login",
        error
      };
    }
    return { error };
  },
  updatePassword: async ({ password }) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      return {
        success: false,
        error: {
          message: "User ID not found",
          name: "Error"
        }
      };
    }
    try {
      await authService.resetPassword(userId, password);
      return {
        success: true,
        redirectTo: "/login"
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: "Failed to change password",
          name: "Update Password Error"
        }
      };
    }
  }
};

// src/dataProvider.ts
var dataProvider = (apiUrl) => ({
  getList: async ({ resource, pagination, sorters, filters }) => {
    const url = new URL(`${apiUrl}/${resource}`);
    if (pagination) {
      const { current, pageSize } = pagination;
      if (current && pageSize) {
        url.searchParams.append("$skip", ((current - 1) * pageSize).toString());
        url.searchParams.append("$top", pageSize.toString());
      }
    }
    if (sorters && sorters.length > 0) {
      const sort = sorters.map((s) => `${s.field} ${s.order}`).join(",");
      url.searchParams.append("$orderby", sort);
    }
    if (filters && filters.length > 0) {
      const filterStrings = filters.map((filter) => {
        if ("field" in filter) {
          const { field, operator, value } = filter;
          if (operator === "eq") {
            return `${field} eq '${value}'`;
          }
          if (operator === "contains") {
            return `contains(${field}, '${value}')`;
          }
          if (operator === "startswith") {
            return `startswith(${field}, '${value}')`;
          }
          if (operator === "endswith") {
            return `endswith(${field}, '${value}')`;
          }
        } else {
          const { operator, value } = filter;
          if (operator === "or") {
            return `(${value.map((f) => `contains(${f.field}, '${f.value}')`).join(" or ")})`;
          }
        }
        return "";
      }).filter((f) => f);
      if (filterStrings.length > 0) {
        url.searchParams.append("$filter", filterStrings.join(" and "));
      }
    }
    url.searchParams.append("$count", "true");
    const response = await httpClient(url.toString());
    if (!response) {
      return { data: [], total: 0 };
    }
    const data = await response.json();
    return {
      data: data.value.map((item) => ({ ...item, id: item.Oid })),
      total: data["@odata.count"] || data.value.length
    };
  },
  getOne: async ({ resource, id, meta }) => {
    const url = new URL(`${apiUrl}/${resource}(${id})`);
    if (meta?.expand) {
      const expand = meta.expand.map((item) => item.field ?? item).join(",");
      if (expand) {
        url.searchParams.append("$expand", expand);
      }
    }
    const response = await httpClient(url.toString());
    if (!response) throw new Error("Item not found");
    const data = await response.json();
    return { data: { ...data, id: data.Oid } };
  },
  create: async ({ resource, variables }) => {
    const response = await httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(variables)
    });
    if (!response) throw new Error("Create failed with no response");
    const data = await response.json();
    return { data };
  },
  update: async ({ resource, id, variables }) => {
    if (resource === "PermissionPolicyRole") {
      const apiBase = apiUrl.endsWith("/odata") ? apiUrl.substring(0, apiUrl.length - 6) : apiUrl;
      const response2 = await httpClient(`${apiBase}/Role/UpdateRole`, {
        method: "POST",
        body: JSON.stringify({ ...variables, Oid: id })
      });
      if (!response2) throw new Error("Update failed with no response");
      try {
        await response2.json();
      } catch {
      }
      return { data: { ...variables, id } };
    }
    const response = await httpClient(`${apiUrl}/${resource}(${id})`, {
      method: "PATCH",
      body: JSON.stringify(variables)
    });
    if (!response) {
      return { data: { id, ...variables } };
    }
    const data = await response.json();
    return { data };
  },
  deleteOne: async ({ resource, id }) => {
    await httpClient(`${apiUrl}/${resource}(${id})`, {
      method: "DELETE"
    });
    return { data: { id } };
  },
  getApiUrl: () => apiUrl,
  getMany: async () => {
    throw new Error("Not implemented");
  },
  createMany: async () => {
    throw new Error("Not implemented");
  },
  deleteMany: async () => {
    throw new Error("Not implemented");
  },
  updateMany: async () => {
    throw new Error("Not implemented");
  },
  custom: async () => {
    throw new Error("Not implemented");
  }
});

// src/interfaces.ts
var SecurityPermissionPolicy = /* @__PURE__ */ ((SecurityPermissionPolicy2) => {
  SecurityPermissionPolicy2["DenyAllByDefault"] = "DenyAllByDefault";
  SecurityPermissionPolicy2["ReadOnlyAllByDefault"] = "ReadOnlyAllByDefault";
  SecurityPermissionPolicy2["AllowAllByDefault"] = "AllowAllByDefault";
  return SecurityPermissionPolicy2;
})(SecurityPermissionPolicy || {});
var SecurityPermissionState = /* @__PURE__ */ ((SecurityPermissionState2) => {
  SecurityPermissionState2["Allow"] = "Allow";
  SecurityPermissionState2["Deny"] = "Deny";
  return SecurityPermissionState2;
})(SecurityPermissionState || {});

// src/components/Header.tsx
var import_react3 = __toESM(require("react"));
var import_core = require("@refinedev/core");
var import_antd4 = require("antd");
var import_icons = require("@ant-design/icons");

// src/contexts/color-mode.tsx
var import_react = __toESM(require("react"));
var import_antd = require("antd");
var import_antd2 = require("@refinedev/antd");
var ColorModeContext = (0, import_react.createContext)(
  {}
);
var ColorModeContextProvider = ({
  children
}) => {
  const colorModeFromLocalStorage = localStorage.getItem("colorMode");
  const isSystemPreferenceDark = window?.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const systemPreference = isSystemPreferenceDark ? "dark" : "light";
  const [mode, setMode] = (0, import_react.useState)(
    colorModeFromLocalStorage || systemPreference
  );
  (0, import_react.useEffect)(() => {
    window.localStorage.setItem("colorMode", mode);
  }, [mode]);
  const setColorMode = () => {
    if (mode === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };
  const { darkAlgorithm, defaultAlgorithm } = import_antd.theme;
  return /* @__PURE__ */ import_react.default.createElement(
    ColorModeContext.Provider,
    {
      value: {
        setMode,
        mode
      }
    },
    /* @__PURE__ */ import_react.default.createElement(
      import_antd.ConfigProvider,
      {
        theme: {
          ...import_antd2.RefineThemes.Blue,
          algorithm: mode === "light" ? defaultAlgorithm : darkAlgorithm
        }
      },
      children
    )
  );
};
var useColorMode = () => {
  const context = (0, import_react.useContext)(ColorModeContext);
  if (context === void 0) {
    throw new Error("useColorMode must be used within a ColorModeContextProvider");
  }
  return context;
};

// src/components/Base64Upload.tsx
var import_react2 = __toESM(require("react"));
var import_antd3 = require("antd");
var Base64Upload = ({ value, onChange }) => {
  return /* @__PURE__ */ import_react2.default.createElement(
    import_antd3.Upload,
    {
      listType: "picture-card",
      maxCount: 1,
      showUploadList: false,
      beforeUpload: (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64 = reader.result;
          const rawBase64 = base64.split(",")[1];
          onChange?.(rawBase64);
        };
        return false;
      }
    },
    value ? /* @__PURE__ */ import_react2.default.createElement("img", { src: `data:image/png;base64,${value}`, alt: "avatar", style: { width: "100%" } }) : /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("div", { style: { marginTop: 8 } }, "Upload"))
  );
};

// src/components/Header.tsx
var { Text } = import_antd4.Typography;
var { useToken } = import_antd4.theme;
var Header = () => {
  const { mutate: logout } = (0, import_core.useLogout)();
  const { mutate: updatePassword } = (0, import_core.useUpdatePassword)();
  const { data: user } = (0, import_core.useGetIdentity)();
  const { mode, setMode } = useColorMode();
  const { token } = useToken();
  const invalidate = (0, import_core.useInvalidate)();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = (0, import_react3.useState)(false);
  const [isPhotoLoading, setIsPhotoLoading] = (0, import_react3.useState)(false);
  const [photoForm] = import_antd4.Form.useForm();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = (0, import_react3.useState)(false);
  const [isPasswordLoading, setIsPasswordLoading] = (0, import_react3.useState)(false);
  const [passwordForm] = import_antd4.Form.useForm();
  const handlePhotoSubmit = async (values) => {
    if (!user?.id) return;
    setIsPhotoLoading(true);
    try {
      const response = await httpClient(`/odata/ApplicationUser(${user.id})`, {
        method: "PATCH",
        body: JSON.stringify({ Photo: values.Photo })
      });
      if (response && response.ok || response === null) {
        import_antd4.message.success("Photo updated successfully");
        localStorage.setItem("user_photo", values.Photo || "");
        invalidate({ resource: "users", invalidates: ["all"] });
        window.location.reload();
      } else {
        import_antd4.message.error("Failed to update photo");
      }
    } catch (error) {
      import_antd4.message.error("Network error");
    } finally {
      setIsPhotoLoading(false);
      setIsPhotoModalOpen(false);
    }
  };
  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    passwordForm.setFieldsValue({ password: retVal });
  };
  const handlePasswordSubmit = async (values) => {
    setIsPasswordLoading(true);
    updatePassword(
      { password: values.password },
      {
        onSuccess: () => {
          import_antd4.message.success("Password changed successfully");
          setIsPasswordModalOpen(false);
          logout();
        },
        onError: (error) => {
          import_antd4.message.error(error?.message || "Failed to change password");
        },
        onSettled: () => {
          setIsPasswordLoading(false);
        }
      }
    );
  };
  const menuItems = [
    {
      key: "user-info",
      label: /* @__PURE__ */ import_react3.default.createElement(import_antd4.Space, { direction: "vertical", size: 0 }, /* @__PURE__ */ import_react3.default.createElement(Text, { strong: true }, user?.name)),
      icon: /* @__PURE__ */ import_react3.default.createElement(import_icons.UserOutlined, null),
      disabled: true,
      style: { cursor: "default", color: token.colorText }
    },
    {
      type: "divider"
    },
    {
      key: "change-photo",
      label: "Change Photo",
      icon: /* @__PURE__ */ import_react3.default.createElement(import_icons.CameraOutlined, null),
      onClick: () => {
        photoForm.setFieldsValue({ Photo: user?.avatar?.replace("data:image/png;base64,", "") });
        setIsPhotoModalOpen(true);
      }
    },
    {
      key: "change-password",
      label: "Change Password",
      icon: /* @__PURE__ */ import_react3.default.createElement(import_icons.LockOutlined, null),
      onClick: () => {
        passwordForm.resetFields();
        setIsPasswordModalOpen(true);
      }
    },
    {
      type: "divider"
    },
    {
      key: "theme",
      label: mode === "light" ? "Dark Theme" : "Light Theme",
      icon: mode === "light" ? /* @__PURE__ */ import_react3.default.createElement(import_icons.MoonOutlined, null) : /* @__PURE__ */ import_react3.default.createElement(import_icons.SunOutlined, null),
      onClick: () => setMode(mode === "light" ? "dark" : "light")
    },
    {
      key: "logout",
      label: "Logout",
      icon: /* @__PURE__ */ import_react3.default.createElement(import_icons.LogoutOutlined, null),
      onClick: () => logout()
    }
  ];
  return /* @__PURE__ */ import_react3.default.createElement(
    import_antd4.Layout.Header,
    {
      style: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 24px",
        height: "64px",
        backgroundColor: token.colorBgElevated,
        position: "sticky",
        top: 0,
        zIndex: 1
      }
    },
    /* @__PURE__ */ import_react3.default.createElement(import_antd4.Space, null, /* @__PURE__ */ import_react3.default.createElement(import_antd4.Dropdown, { menu: { items: menuItems }, trigger: ["click"] }, /* @__PURE__ */ import_react3.default.createElement(import_antd4.Button, { type: "text", style: { height: 48 } }, /* @__PURE__ */ import_react3.default.createElement(import_antd4.Space, null, /* @__PURE__ */ import_react3.default.createElement(import_antd4.Avatar, { src: user?.avatar, alt: user?.name, icon: /* @__PURE__ */ import_react3.default.createElement(import_icons.UserOutlined, null) }), /* @__PURE__ */ import_react3.default.createElement(Text, null, user?.name), /* @__PURE__ */ import_react3.default.createElement(import_icons.DownOutlined, { style: { fontSize: 12 } }))))),
    /* @__PURE__ */ import_react3.default.createElement(
      import_antd4.Modal,
      {
        title: "Change Photo",
        open: isPhotoModalOpen,
        onCancel: () => setIsPhotoModalOpen(false),
        onOk: () => photoForm.submit(),
        confirmLoading: isPhotoLoading
      },
      /* @__PURE__ */ import_react3.default.createElement(import_antd4.Form, { form: photoForm, onFinish: handlePhotoSubmit, layout: "vertical" }, /* @__PURE__ */ import_react3.default.createElement(import_antd4.Form.Item, { name: "Photo", label: "Upload Photo" }, /* @__PURE__ */ import_react3.default.createElement(Base64Upload, null)))
    ),
    /* @__PURE__ */ import_react3.default.createElement(
      import_antd4.Modal,
      {
        title: "Change Password",
        open: isPasswordModalOpen,
        onCancel: () => setIsPasswordModalOpen(false),
        onOk: () => passwordForm.submit(),
        confirmLoading: isPasswordLoading
      },
      /* @__PURE__ */ import_react3.default.createElement(import_antd4.Form, { form: passwordForm, onFinish: handlePasswordSubmit, layout: "vertical" }, /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-end" } }, /* @__PURE__ */ import_react3.default.createElement(
        import_antd4.Form.Item,
        {
          name: "password",
          label: "New Password",
          style: { flex: 1, marginBottom: 0 },
          rules: [{ required: true, message: "Please input the new password!" }]
        },
        /* @__PURE__ */ import_react3.default.createElement(import_antd4.Input.Password, { placeholder: "Enter new password" })
      ), /* @__PURE__ */ import_react3.default.createElement(import_antd4.Button, { icon: /* @__PURE__ */ import_react3.default.createElement(import_icons.ThunderboltOutlined, null), onClick: generatePassword })))
    )
  );
};

// src/components/SharedList.tsx
var import_react4 = __toESM(require("react"));
var import_antd5 = require("@refinedev/antd");
var import_antd6 = require("antd");
var import_icons2 = require("@ant-design/icons");
var SharedList = ({
  children,
  resource,
  searchFields
}) => {
  const { tableProps, searchFormProps, tableQueryResult, queryResult, setFilters } = (0, import_antd5.useTable)({
    resource,
    syncWithLocation: true,
    onSearch: (params) => {
      const filters = [];
      const { search } = params;
      if (search && searchFields && searchFields.length > 0) {
        filters.push({
          operator: "or",
          value: searchFields.map((field) => ({
            field,
            operator: "contains",
            value: search
          }))
        });
      }
      return filters;
    }
  });
  const columns = import_react4.default.Children.toArray(children).map((child) => {
    return {
      key: child.props.dataIndex || child.props.title || "unknown",
      title: child.props.title,
      dataIndex: child.props.dataIndex,
      defaultVisible: child.props.defaultVisible
    };
  });
  const [visibleColumns, setVisibleColumns] = (0, import_react4.useState)([]);
  (0, import_react4.useEffect)(() => {
    const allKeys = columns.map((c) => c.key?.toString());
    const storageKey = `table-columns-${resource}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validSaved = parsed.filter((k) => allKeys.includes(k));
        if (validSaved.length > 0) {
          setVisibleColumns(validSaved);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved columns", e);
      }
    }
    const defaultVisible = columns.filter((c) => c.defaultVisible || c.dataIndex === "actions").map((c) => c.key?.toString());
    setVisibleColumns(defaultVisible);
  }, [children, resource]);
  const handleColumnChange = (key, checked) => {
    let newVisible;
    if (checked) {
      newVisible = [...visibleColumns, key];
    } else {
      newVisible = visibleColumns.filter((k) => k !== key);
    }
    setVisibleColumns(newVisible);
    localStorage.setItem(`table-columns-${resource}`, JSON.stringify(newVisible));
  };
  const handleResetColumns = () => {
    const defaultVisible = columns.filter((c) => c.defaultVisible || c.dataIndex === "actions").map((c) => c.key?.toString());
    setVisibleColumns(defaultVisible);
    localStorage.removeItem(`table-columns-${resource}`);
  };
  const content = /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } }, /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" } }, /* @__PURE__ */ import_react4.default.createElement("span", { style: { fontWeight: 500 } }, "Select Columns"), /* @__PURE__ */ import_react4.default.createElement(import_antd6.Button, { size: "small", type: "link", onClick: handleResetColumns, style: { padding: 0 } }, "Reset")), columns.filter((col) => col.dataIndex !== "actions").map((col) => /* @__PURE__ */ import_react4.default.createElement(
    import_antd6.Checkbox,
    {
      key: col.key,
      checked: visibleColumns.includes(col.key),
      onChange: (e) => handleColumnChange(col.key, e.target.checked)
    },
    col.title || col.dataIndex
  )));
  const filteredChildren = import_react4.default.Children.toArray(children).filter((child) => {
    const key = child.props.dataIndex || child.props.title || "unknown";
    return visibleColumns.includes(key);
  }).map((child) => {
    if (child.props.dataIndex) {
      return import_react4.default.cloneElement(child, { key: child.props.dataIndex });
    }
    return child;
  });
  return /* @__PURE__ */ import_react4.default.createElement(import_antd5.List, null, /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 20 } }, /* @__PURE__ */ import_react4.default.createElement(import_antd6.Form, { ...searchFormProps, layout: "inline" }, /* @__PURE__ */ import_react4.default.createElement(import_antd6.Form.Item, { name: "search" }, /* @__PURE__ */ import_react4.default.createElement(
    import_antd6.Input.Search,
    {
      placeholder: "Search...",
      style: { width: 300 },
      allowClear: true,
      onSearch: (value) => {
        if (!value) {
          window.location.search = "";
        } else {
          searchFormProps.onFinish?.({ search: value });
        }
      }
    }
  ))), /* @__PURE__ */ import_react4.default.createElement(import_antd6.Space, null, /* @__PURE__ */ import_react4.default.createElement(import_antd6.Button, { icon: /* @__PURE__ */ import_react4.default.createElement(import_icons2.ReloadOutlined, null), onClick: () => (tableQueryResult || queryResult)?.refetch() }, "Refresh"), /* @__PURE__ */ import_react4.default.createElement(import_antd6.Popover, { content, title: "Columns", trigger: "click", placement: "bottomRight" }, /* @__PURE__ */ import_react4.default.createElement(import_antd6.Button, { icon: /* @__PURE__ */ import_react4.default.createElement(import_icons2.SettingOutlined, null) }, "Columns")))), /* @__PURE__ */ import_react4.default.createElement(import_antd6.Table, { ...tableProps, rowKey: "Oid" }, filteredChildren));
};

// src/components/SharedDetailList.tsx
var import_react5 = __toESM(require("react"));
var import_antd7 = require("antd");
var import_icons3 = require("@ant-design/icons");
var import_antd8 = require("@refinedev/antd");
var import_core2 = require("@refinedev/core");
var DetailModal = ({
  modalForm,
  mode,
  modalTitle,
  FormFields,
  masterField,
  masterId
}) => {
  const { modalProps, formProps } = modalForm;
  const { form } = formProps;
  import_react5.default.useEffect(() => {
    if (masterId && form) {
      form.setFieldValue([masterField, "Oid"], masterId);
    }
  }, [masterId, form, masterField]);
  return /* @__PURE__ */ import_react5.default.createElement(
    import_antd7.Modal,
    {
      ...modalProps,
      title: modalTitle,
      width: 600,
      okButtonProps: {
        ...modalProps.okButtonProps,
        "data-testid": `detail-modal-save-btn-${mode}`
      }
    },
    /* @__PURE__ */ import_react5.default.createElement(import_antd7.Form, { ...formProps, layout: "vertical" }, /* @__PURE__ */ import_react5.default.createElement(FormFields, { mode }), /* @__PURE__ */ import_react5.default.createElement(
      import_antd7.Form.Item,
      {
        name: [masterField, "Oid"],
        hidden: true
      },
      /* @__PURE__ */ import_react5.default.createElement(import_antd7.Input, null)
    ))
  );
};
var SharedDetailList = ({
  resource,
  masterField,
  masterId,
  dataSource,
  onMutationSuccess,
  FormFields,
  modalTitle = "Manage Detail",
  children
}) => {
  const createModalForm = (0, import_antd8.useModalForm)({
    resource,
    action: "create",
    redirect: false,
    onMutationSuccess
  });
  const editModalForm = (0, import_antd8.useModalForm)({
    resource,
    action: "edit",
    redirect: false,
    onMutationSuccess
  });
  const { mutate: deleteMutate } = (0, import_core2.useDelete)();
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this detail?")) {
      deleteMutate({
        resource,
        id,
        mutationMode: "optimistic"
      }, {
        onSuccess: onMutationSuccess
      });
    }
  };
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "shared-detail-list" }, /* @__PURE__ */ import_react5.default.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 16 } }, /* @__PURE__ */ import_react5.default.createElement(
    import_antd7.Button,
    {
      type: "primary",
      icon: /* @__PURE__ */ import_react5.default.createElement(import_icons3.PlusOutlined, null),
      onClick: () => createModalForm.show(),
      disabled: !masterId,
      "data-testid": "add-detail-btn"
    },
    "Add Detail"
  )), /* @__PURE__ */ import_react5.default.createElement(
    import_antd7.Table,
    {
      dataSource,
      rowKey: "Oid",
      pagination: false,
      bordered: true,
      size: "small"
    },
    children,
    /* @__PURE__ */ import_react5.default.createElement(
      import_antd7.Table.Column,
      {
        title: "Actions",
        key: "actions",
        width: 120,
        render: (_, record) => /* @__PURE__ */ import_react5.default.createElement(import_antd7.Space, null, /* @__PURE__ */ import_react5.default.createElement(
          import_antd7.Button,
          {
            icon: /* @__PURE__ */ import_react5.default.createElement(import_icons3.EditOutlined, null),
            size: "small",
            onClick: () => editModalForm.show(record.id ?? record.Oid)
          }
        ), /* @__PURE__ */ import_react5.default.createElement(
          import_antd7.Button,
          {
            icon: /* @__PURE__ */ import_react5.default.createElement(import_icons3.DeleteOutlined, null),
            size: "small",
            danger: true,
            onClick: () => handleDelete(record.id ?? record.Oid)
          }
        ))
      }
    )
  ), /* @__PURE__ */ import_react5.default.createElement(
    DetailModal,
    {
      modalForm: createModalForm,
      mode: "create",
      modalTitle,
      FormFields,
      masterField,
      masterId
    }
  ), /* @__PURE__ */ import_react5.default.createElement(
    DetailModal,
    {
      modalForm: editModalForm,
      mode: "edit",
      modalTitle,
      FormFields,
      masterField,
      masterId
    }
  ));
};

// src/pages/login/index.tsx
var import_react6 = __toESM(require("react"));
var import_core3 = require("@refinedev/core");
var import_antd9 = require("antd");
var import_antd10 = require("@refinedev/antd");
var { Title, Link } = import_antd9.Typography;
var LoginPage = () => {
  const [form] = import_antd9.Form.useForm();
  const { mutate: login, isPending } = (0, import_core3.useLogin)();
  const isLoading = isPending;
  const translate = (0, import_core3.useTranslate)();
  const { token } = import_antd9.theme.useToken();
  const onFinish = async (values) => {
    login(values);
  };
  return /* @__PURE__ */ import_react6.default.createElement(
    import_antd9.Layout,
    {
      style: {
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: token.colorBgContainer
      }
    },
    /* @__PURE__ */ import_react6.default.createElement("div", { style: { marginBottom: "24px" } }, /* @__PURE__ */ import_react6.default.createElement(
      import_antd10.ThemedTitle,
      {
        collapsed: false,
        wrapperStyles: { fontSize: "22px", justifyContent: "center" }
      }
    )),
    /* @__PURE__ */ import_react6.default.createElement(
      import_antd9.Card,
      {
        style: {
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
          boxShadow: "0 4px 24px -4px rgba(0, 0, 0, 0.1)"
        }
      },
      /* @__PURE__ */ import_react6.default.createElement("div", { style: { textAlign: "center", marginBottom: "32px" } }, /* @__PURE__ */ import_react6.default.createElement(Title, { level: 3, style: { color: token.colorPrimary, margin: 0 } }, translate("pages.login.title", "Sign in to your account"))),
      /* @__PURE__ */ import_react6.default.createElement(
        import_antd9.Form,
        {
          layout: "vertical",
          form,
          onFinish,
          initialValues: {
            remember: false
          }
        },
        /* @__PURE__ */ import_react6.default.createElement(
          import_antd9.Form.Item,
          {
            label: translate("pages.login.fields.username", "Username"),
            name: "username",
            rules: [
              {
                required: true,
                message: translate(
                  "pages.login.errors.requiredUsername",
                  "Please input your username"
                )
              }
            ]
          },
          /* @__PURE__ */ import_react6.default.createElement(import_antd9.Input, { size: "large", placeholder: "Username" })
        ),
        /* @__PURE__ */ import_react6.default.createElement(
          import_antd9.Form.Item,
          {
            label: translate("pages.login.fields.password", "Password"),
            name: "password",
            rules: [
              {
                required: true,
                message: translate(
                  "pages.login.errors.requiredPassword",
                  "Please input your password"
                )
              }
            ]
          },
          /* @__PURE__ */ import_react6.default.createElement(import_antd9.Input.Password, { size: "large", placeholder: "Password" })
        ),
        /* @__PURE__ */ import_react6.default.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px"
            }
          },
          /* @__PURE__ */ import_react6.default.createElement(import_antd9.Form.Item, { name: "remember", valuePropName: "checked", noStyle: true }, /* @__PURE__ */ import_react6.default.createElement(import_antd9.Checkbox, null, translate("pages.login.buttons.rememberMe", "Remember me"))),
          /* @__PURE__ */ import_react6.default.createElement(
            Link,
            {
              onClick: () => {
              },
              style: { fontSize: "14px" }
            },
            translate("pages.login.buttons.forgotPassword", "Forgot password?")
          )
        ),
        /* @__PURE__ */ import_react6.default.createElement(import_antd9.Form.Item, null, /* @__PURE__ */ import_react6.default.createElement(
          import_antd9.Button,
          {
            type: "primary",
            htmlType: "submit",
            loading: isLoading,
            block: true,
            size: "large"
          },
          translate("pages.login.signin", "Sign in")
        ))
      )
    )
  );
};

// src/pages/application-users/list.tsx
var import_react7 = __toESM(require("react"));
var import_core4 = require("@refinedev/core");
var import_antd11 = require("@refinedev/antd");
var import_antd12 = require("antd");
var import_icons4 = require("@ant-design/icons");
var ApplicationUserList = () => {
  const [isModalOpen, setIsModalOpen] = (0, import_react7.useState)(false);
  const [selectedUser, setSelectedUser] = (0, import_react7.useState)(null);
  const [form] = import_antd12.Form.useForm();
  const { open } = (0, import_core4.useNotification)();
  const [isLoading, setIsLoading] = (0, import_react7.useState)(false);
  const handleResetPasswordClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    form.resetFields();
  };
  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    form.setFieldsValue({ password: retVal });
  };
  const handleResetPasswordSubmit = async (values) => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      await authService.resetPassword(selectedUser.Oid, values.password);
      open?.({
        type: "success",
        message: "Success",
        description: "Password reset successfully"
      });
      setIsModalOpen(false);
    } catch (error) {
      open?.({
        type: "error",
        message: "Error",
        description: "Failed to reset password"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement(
    SharedList,
    {
      searchFields: ["UserName", "DisplayName", "Email"]
    },
    /* @__PURE__ */ import_react7.default.createElement(
      import_antd12.Table.Column,
      {
        dataIndex: "Photo",
        title: "Photo",
        render: (value) => value ? /* @__PURE__ */ import_react7.default.createElement("img", { src: `data:image/png;base64,${value}`, alt: "User", style: { height: 40, width: 40, objectFit: "cover", borderRadius: "50%" } }) : "-"
      }
    ),
    /* @__PURE__ */ import_react7.default.createElement(
      import_antd12.Table.Column,
      {
        dataIndex: "DisplayName",
        title: "Display Name",
        sorter: true,
        defaultSortOrder: "ascend",
        defaultVisible: true
      }
    ),
    /* @__PURE__ */ import_react7.default.createElement(
      import_antd12.Table.Column,
      {
        dataIndex: "UserName",
        title: "User Name",
        sorter: true,
        defaultVisible: true
      }
    ),
    /* @__PURE__ */ import_react7.default.createElement(
      import_antd12.Table.Column,
      {
        dataIndex: "Email",
        title: "Email",
        sorter: true
      }
    ),
    /* @__PURE__ */ import_react7.default.createElement(
      import_antd12.Table.Column,
      {
        dataIndex: "IsActive",
        title: "Active",
        render: (value) => /* @__PURE__ */ import_react7.default.createElement(import_antd12.Checkbox, { checked: value, disabled: true }),
        sorter: true
      }
    ),
    /* @__PURE__ */ import_react7.default.createElement(
      import_antd12.Table.Column,
      {
        dataIndex: "AccessFailedCount",
        title: "Access Failed Count"
      }
    ),
    /* @__PURE__ */ import_react7.default.createElement(
      import_antd12.Table.Column,
      {
        title: "Actions",
        dataIndex: "actions",
        render: (_, record) => /* @__PURE__ */ import_react7.default.createElement(import_antd12.Space, null, /* @__PURE__ */ import_react7.default.createElement(import_antd12.Tooltip, { title: "Reset Password" }, /* @__PURE__ */ import_react7.default.createElement(
          import_antd12.Button,
          {
            size: "small",
            icon: /* @__PURE__ */ import_react7.default.createElement(import_icons4.KeyOutlined, null),
            onClick: () => handleResetPasswordClick(record)
          }
        )), /* @__PURE__ */ import_react7.default.createElement(import_antd11.EditButton, { hideText: true, size: "small", recordItemId: record.Oid }), /* @__PURE__ */ import_react7.default.createElement(import_antd11.DeleteButton, { hideText: true, size: "small", recordItemId: record.Oid }))
      }
    )
  ), /* @__PURE__ */ import_react7.default.createElement(
    import_antd12.Modal,
    {
      title: `Reset Password for ${selectedUser?.DisplayName || selectedUser?.UserName}`,
      open: isModalOpen,
      onCancel: () => setIsModalOpen(false),
      onOk: () => form.submit(),
      confirmLoading: isLoading
    },
    /* @__PURE__ */ import_react7.default.createElement(import_antd12.Form, { form, onFinish: handleResetPasswordSubmit, layout: "vertical" }, /* @__PURE__ */ import_react7.default.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-end" } }, /* @__PURE__ */ import_react7.default.createElement(
      import_antd12.Form.Item,
      {
        name: "password",
        label: "New Password",
        style: { flex: 1, marginBottom: 0 },
        rules: [{ required: true, message: "Please input the new password!" }]
      },
      /* @__PURE__ */ import_react7.default.createElement(import_antd12.Input.Password, { placeholder: "Enter new password" })
    ), /* @__PURE__ */ import_react7.default.createElement(import_antd12.Tooltip, { title: "Generate Complex Password" }, /* @__PURE__ */ import_react7.default.createElement(import_antd12.Button, { icon: /* @__PURE__ */ import_react7.default.createElement(import_icons4.ThunderboltOutlined, null), onClick: generatePassword }))))
  ));
};

// src/pages/application-users/create.tsx
var import_react8 = __toESM(require("react"));
var import_antd13 = require("@refinedev/antd");
var import_antd14 = require("antd");
var ApplicationUserCreate = () => {
  const { formProps, saveButtonProps } = (0, import_antd13.useForm)();
  return /* @__PURE__ */ import_react8.default.createElement(import_antd13.Create, { saveButtonProps }, /* @__PURE__ */ import_react8.default.createElement(import_antd14.Form, { ...formProps, layout: "vertical" }, /* @__PURE__ */ import_react8.default.createElement(
    import_antd14.Form.Item,
    {
      label: "User Name",
      name: "UserName",
      rules: [
        {
          required: true
        }
      ]
    },
    /* @__PURE__ */ import_react8.default.createElement(import_antd14.Input, null)
  ), /* @__PURE__ */ import_react8.default.createElement(
    import_antd14.Form.Item,
    {
      label: "Display Name",
      name: "DisplayName"
    },
    /* @__PURE__ */ import_react8.default.createElement(import_antd14.Input, null)
  ), /* @__PURE__ */ import_react8.default.createElement(
    import_antd14.Form.Item,
    {
      label: "Email",
      name: "Email",
      rules: [
        {
          type: "email"
        }
      ]
    },
    /* @__PURE__ */ import_react8.default.createElement(import_antd14.Input, null)
  ), /* @__PURE__ */ import_react8.default.createElement(
    import_antd14.Form.Item,
    {
      label: "Is Active",
      name: "IsActive",
      valuePropName: "checked",
      initialValue: true
    },
    /* @__PURE__ */ import_react8.default.createElement(import_antd14.Checkbox, null, "Active")
  ), /* @__PURE__ */ import_react8.default.createElement(
    import_antd14.Form.Item,
    {
      label: "Photo",
      name: "Photo"
    },
    /* @__PURE__ */ import_react8.default.createElement(Base64Upload, null)
  )));
};

// src/pages/application-users/edit.tsx
var import_react9 = __toESM(require("react"));
var import_antd15 = require("@refinedev/antd");
var import_antd16 = require("antd");
var ApplicationUserEdit = () => {
  const { message: message2 } = import_antd16.App.useApp();
  const { formProps, saveButtonProps, id, form } = (0, import_antd15.useForm)({
    meta: {
      expand: ["Roles"]
    },
    onMutationSuccess: async (data, variables, context) => {
      const roles = form?.getFieldValue("Roles");
      const roleIds = Array.isArray(roles) ? roles.map((r) => r && typeof r === "object" && "Oid" in r ? r.Oid : r) : [];
      try {
        const response = await fetch(`${getBaseUrl()}/User/UpdateUserRoles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("refine-auth")}`
          },
          body: JSON.stringify({
            UserId: id,
            RoleIds: roleIds
          })
        });
        if (response.ok) {
          message2.success("Roles updated successfully");
        } else {
          message2.error("Failed to update roles");
        }
      } catch (e) {
        message2.error("Error updating roles");
      }
    }
  });
  const { selectProps: roleSelectProps } = (0, import_antd15.useSelect)({
    resource: "PermissionPolicyRole",
    optionLabel: "Name",
    optionValue: "Oid"
  });
  const handleOnFinish = (values) => {
    const { Roles, ...userValues } = values;
    formProps.onFinish?.(userValues);
  };
  return /* @__PURE__ */ import_react9.default.createElement(import_antd15.Edit, { saveButtonProps }, /* @__PURE__ */ import_react9.default.createElement(import_antd16.Form, { ...formProps, layout: "vertical", onFinish: handleOnFinish }, /* @__PURE__ */ import_react9.default.createElement(
    import_antd16.Form.Item,
    {
      label: "User Name",
      name: "UserName",
      rules: [
        {
          required: true
        }
      ]
    },
    /* @__PURE__ */ import_react9.default.createElement(import_antd16.Input, null)
  ), /* @__PURE__ */ import_react9.default.createElement(
    import_antd16.Form.Item,
    {
      label: "Display Name",
      name: "DisplayName"
    },
    /* @__PURE__ */ import_react9.default.createElement(import_antd16.Input, null)
  ), /* @__PURE__ */ import_react9.default.createElement(
    import_antd16.Form.Item,
    {
      label: "Email",
      name: "Email",
      rules: [
        {
          type: "email"
        }
      ]
    },
    /* @__PURE__ */ import_react9.default.createElement(import_antd16.Input, null)
  ), /* @__PURE__ */ import_react9.default.createElement(
    import_antd16.Form.Item,
    {
      label: "Is Active",
      name: "IsActive",
      valuePropName: "checked"
    },
    /* @__PURE__ */ import_react9.default.createElement(import_antd16.Checkbox, null, "Active")
  ), /* @__PURE__ */ import_react9.default.createElement(
    import_antd16.Form.Item,
    {
      label: "Roles",
      name: "Roles",
      getValueProps: (value) => {
        if (Array.isArray(value)) {
          return {
            value: value.map((r) => {
              if (r && typeof r === "object" && "Oid" in r) {
                return r.Oid;
              }
              return r;
            })
          };
        }
        return { value: [] };
      }
    },
    /* @__PURE__ */ import_react9.default.createElement(import_antd16.Select, { ...roleSelectProps, mode: "multiple" })
  ), /* @__PURE__ */ import_react9.default.createElement(
    import_antd16.Form.Item,
    {
      label: "Photo",
      name: "Photo"
    },
    /* @__PURE__ */ import_react9.default.createElement(Base64Upload, null)
  )));
};

// src/pages/roles/list.tsx
var import_react10 = __toESM(require("react"));
var import_antd17 = require("@refinedev/antd");
var import_antd18 = require("antd");
var RoleList = () => {
  const { tableProps } = (0, import_antd17.useTable)({
    syncWithLocation: true
  });
  return /* @__PURE__ */ import_react10.default.createElement(import_antd17.List, null, /* @__PURE__ */ import_react10.default.createElement(import_antd18.Table, { ...tableProps, rowKey: "Oid" }, /* @__PURE__ */ import_react10.default.createElement(import_antd18.Table.Column, { dataIndex: "Name", title: "Name" }), /* @__PURE__ */ import_react10.default.createElement(
    import_antd18.Table.Column,
    {
      dataIndex: "IsAdministrative",
      title: "Is Administrative",
      render: (value) => /* @__PURE__ */ import_react10.default.createElement(import_antd18.Checkbox, { checked: value, disabled: true })
    }
  ), /* @__PURE__ */ import_react10.default.createElement(import_antd18.Table.Column, { dataIndex: "PermissionPolicy", title: "Permission Policy" }), /* @__PURE__ */ import_react10.default.createElement(
    import_antd18.Table.Column,
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => /* @__PURE__ */ import_react10.default.createElement(import_antd18.Space, null, /* @__PURE__ */ import_react10.default.createElement(import_antd17.EditButton, { hideText: true, size: "small", recordItemId: record.Oid }), /* @__PURE__ */ import_react10.default.createElement(import_antd17.DeleteButton, { hideText: true, size: "small", recordItemId: record.Oid }))
    }
  )));
};

// src/pages/roles/create.tsx
var import_react12 = __toESM(require("react"));
var import_antd20 = require("@refinedev/antd");
var import_antd21 = require("antd");

// src/pages/roles/TypePermissionList.tsx
var import_react11 = __toESM(require("react"));
var import_antd19 = require("antd");

// src/hooks/useModelTypes.ts
var import_react_query = require("@tanstack/react-query");
var useModelTypes = () => {
  return (0, import_react_query.useQuery)({
    queryKey: ["modelTypes"],
    queryFn: async () => {
      const response = await httpClient("/Model/BusinessObjects");
      if (!response) return [];
      const data = await response.json();
      return data.map((item) => ({
        ...item,
        Label: item.Caption,
        Value: item.Name
      }));
    },
    staleTime: Infinity
  });
};

// src/pages/roles/TypePermissionList.tsx
var TypePermissionList = ({ dataSource }) => {
  const { data: modelTypes } = useModelTypes();
  const typeOptions = modelTypes?.filter((t) => t.IsCreatable && !t.IsDeprecated).map((t) => ({ label: t.Caption, value: t.Name })) || [];
  const PermissionSelect = () => /* @__PURE__ */ import_react11.default.createElement(
    import_antd19.Select,
    {
      allowClear: true,
      options: [
        { label: "Allow", value: "Allow" /* Allow */ },
        { label: "Deny", value: "Deny" /* Deny */ }
      ]
    }
  );
  return /* @__PURE__ */ import_react11.default.createElement(
    SharedDetailList,
    {
      resource: "PermissionPolicyTypePermissions",
      masterField: "Role",
      dataSource,
      modalTitle: "Type Permission",
      FormFields: ({ mode }) => /* @__PURE__ */ import_react11.default.createElement(import_react11.default.Fragment, null, /* @__PURE__ */ import_react11.default.createElement(
        import_antd19.Form.Item,
        {
          label: "Target Type",
          name: "TargetType",
          rules: [{ required: true }]
        },
        /* @__PURE__ */ import_react11.default.createElement(
          import_antd19.Select,
          {
            showSearch: true,
            options: typeOptions,
            filterOption: (input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        )
      ), /* @__PURE__ */ import_react11.default.createElement(import_antd19.Form.Item, { label: "Read State", name: "ReadState" }, /* @__PURE__ */ import_react11.default.createElement(PermissionSelect, null)), /* @__PURE__ */ import_react11.default.createElement(import_antd19.Form.Item, { label: "Write State", name: "WriteState" }, /* @__PURE__ */ import_react11.default.createElement(PermissionSelect, null)), /* @__PURE__ */ import_react11.default.createElement(import_antd19.Form.Item, { label: "Create State", name: "CreateState" }, /* @__PURE__ */ import_react11.default.createElement(PermissionSelect, null)), /* @__PURE__ */ import_react11.default.createElement(import_antd19.Form.Item, { label: "Delete State", name: "DeleteState" }, /* @__PURE__ */ import_react11.default.createElement(PermissionSelect, null)), /* @__PURE__ */ import_react11.default.createElement(import_antd19.Form.Item, { label: "Navigate State", name: "NavigateState" }, /* @__PURE__ */ import_react11.default.createElement(PermissionSelect, null)))
    },
    /* @__PURE__ */ import_react11.default.createElement(import_antd19.Table.Column, { dataIndex: "TargetType", title: "Target Type" }),
    /* @__PURE__ */ import_react11.default.createElement(import_antd19.Table.Column, { dataIndex: "ReadState", title: "Read" }),
    /* @__PURE__ */ import_react11.default.createElement(import_antd19.Table.Column, { dataIndex: "WriteState", title: "Write" }),
    /* @__PURE__ */ import_react11.default.createElement(import_antd19.Table.Column, { dataIndex: "CreateState", title: "Create" }),
    /* @__PURE__ */ import_react11.default.createElement(import_antd19.Table.Column, { dataIndex: "DeleteState", title: "Delete" }),
    /* @__PURE__ */ import_react11.default.createElement(import_antd19.Table.Column, { dataIndex: "NavigateState", title: "Navigate" })
  );
};

// src/pages/roles/create.tsx
var RoleCreate = () => {
  const [form] = import_antd21.Form.useForm();
  const { formProps, saveButtonProps } = (0, import_antd20.useForm)();
  const handleSave = () => {
    form.submit();
  };
  return /* @__PURE__ */ import_react12.default.createElement(import_antd20.Create, { saveButtonProps: { ...saveButtonProps, onClick: handleSave } }, /* @__PURE__ */ import_react12.default.createElement(
    import_antd21.Form,
    {
      ...formProps,
      form,
      layout: "vertical",
      onFinish: (values) => {
        return formProps.onFinish && formProps.onFinish(values);
      }
    },
    /* @__PURE__ */ import_react12.default.createElement(
      import_antd21.Form.Item,
      {
        label: "Name",
        name: "Name",
        rules: [{ required: true }]
      },
      /* @__PURE__ */ import_react12.default.createElement(import_antd21.Input, null)
    ),
    /* @__PURE__ */ import_react12.default.createElement(
      import_antd21.Form.Item,
      {
        label: "Is Administrative",
        name: "IsAdministrative",
        valuePropName: "checked"
      },
      /* @__PURE__ */ import_react12.default.createElement(import_antd21.Checkbox, null, "Is Administrative")
    ),
    /* @__PURE__ */ import_react12.default.createElement(
      import_antd21.Form.Item,
      {
        label: "Permission Policy",
        name: "PermissionPolicy",
        initialValue: "DenyAllByDefault" /* DenyAllByDefault */,
        rules: [{ required: true }]
      },
      /* @__PURE__ */ import_react12.default.createElement(
        import_antd21.Select,
        {
          options: [
            { label: "Deny All By Default", value: "DenyAllByDefault" /* DenyAllByDefault */ },
            { label: "Read Only All By Default", value: "ReadOnlyAllByDefault" /* ReadOnlyAllByDefault */ },
            { label: "Allow All By Default", value: "AllowAllByDefault" /* AllowAllByDefault */ }
          ]
        }
      )
    ),
    /* @__PURE__ */ import_react12.default.createElement(TypePermissionList, null)
  ));
};

// src/pages/roles/edit.tsx
var import_react13 = __toESM(require("react"));
var import_antd22 = require("@refinedev/antd");
var import_antd23 = require("antd");
var RoleEdit = () => {
  const [form] = import_antd23.Form.useForm();
  const { formProps, saveButtonProps } = (0, import_antd22.useForm)({
    meta: {
      expand: [
        { field: "TypePermissions" }
      ]
    }
  });
  const handleSave = () => {
    form.submit();
  };
  import_react13.default.useEffect(() => {
    if (formProps.initialValues) {
      const values = { ...formProps.initialValues };
      if (values.TypePermissions) {
        values.TypePermissions = values.TypePermissions.map((p) => ({
          ...p,
          TargetType: p.TargetType || p.TargetTypeFullName || ""
        }));
      }
      form.setFieldsValue(values);
    }
  }, [formProps.initialValues]);
  return /* @__PURE__ */ import_react13.default.createElement(import_antd22.Edit, { saveButtonProps: { ...saveButtonProps, onClick: handleSave } }, /* @__PURE__ */ import_react13.default.createElement(
    import_antd23.Form,
    {
      ...formProps,
      form,
      layout: "vertical",
      onFinish: (values) => {
        return formProps.onFinish && formProps.onFinish(values);
      }
    },
    /* @__PURE__ */ import_react13.default.createElement(
      import_antd23.Form.Item,
      {
        label: "Name",
        name: "Name",
        rules: [{ required: true }]
      },
      /* @__PURE__ */ import_react13.default.createElement(import_antd23.Input, null)
    ),
    /* @__PURE__ */ import_react13.default.createElement(
      import_antd23.Form.Item,
      {
        label: "Is Administrative",
        name: "IsAdministrative",
        valuePropName: "checked"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_antd23.Checkbox, null, "Is Administrative")
    ),
    /* @__PURE__ */ import_react13.default.createElement(
      import_antd23.Form.Item,
      {
        label: "Permission Policy",
        name: "PermissionPolicy",
        rules: [{ required: true }]
      },
      /* @__PURE__ */ import_react13.default.createElement(
        import_antd23.Select,
        {
          options: [
            { label: "Deny All By Default", value: "DenyAllByDefault" /* DenyAllByDefault */ },
            { label: "Read Only All By Default", value: "ReadOnlyAllByDefault" /* ReadOnlyAllByDefault */ },
            { label: "Allow All By Default", value: "AllowAllByDefault" /* AllowAllByDefault */ }
          ]
        }
      )
    ),
    /* @__PURE__ */ import_react13.default.createElement(TypePermissionList, null)
  ));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApplicationUserCreate,
  ApplicationUserEdit,
  ApplicationUserList,
  Base64Upload,
  ColorModeContext,
  ColorModeContextProvider,
  Header,
  HttpError,
  LoginPage,
  RoleCreate,
  RoleEdit,
  RoleList,
  SecurityPermissionPolicy,
  SecurityPermissionState,
  SharedDetailList,
  SharedList,
  TOKEN_KEY,
  authProvider,
  authService,
  dataProvider,
  getBaseUrl,
  httpClient,
  parseJwt,
  useColorMode,
  useModelTypes
});
