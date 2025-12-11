var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/utils/httpClient.ts
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
  return import.meta.env?.VITE_API_URL || "";
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
import React3, { useState as useState2 } from "react";
import { useLogout, useGetIdentity, useInvalidate, useUpdatePassword } from "@refinedev/core";
import { Layout, Button, Space, Typography, Avatar, theme as theme2, Dropdown, Modal, Form, Input, message } from "antd";
import { LogoutOutlined, UserOutlined, DownOutlined, SunOutlined, MoonOutlined, CameraOutlined, LockOutlined, ThunderboltOutlined } from "@ant-design/icons";

// src/contexts/color-mode.tsx
import React, {
  createContext,
  useEffect,
  useState,
  useContext
} from "react";
import { ConfigProvider, theme } from "antd";
import { RefineThemes } from "@refinedev/antd";
var ColorModeContext = createContext(
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
  const [mode, setMode] = useState(
    colorModeFromLocalStorage || systemPreference
  );
  useEffect(() => {
    window.localStorage.setItem("colorMode", mode);
  }, [mode]);
  const setColorMode = () => {
    if (mode === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };
  const { darkAlgorithm, defaultAlgorithm } = theme;
  return /* @__PURE__ */ React.createElement(
    ColorModeContext.Provider,
    {
      value: {
        setMode,
        mode
      }
    },
    /* @__PURE__ */ React.createElement(
      ConfigProvider,
      {
        theme: {
          ...RefineThemes.Blue,
          algorithm: mode === "light" ? defaultAlgorithm : darkAlgorithm
        }
      },
      children
    )
  );
};
var useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (context === void 0) {
    throw new Error("useColorMode must be used within a ColorModeContextProvider");
  }
  return context;
};

// src/components/Base64Upload.tsx
import React2 from "react";
import { Upload } from "antd";
var Base64Upload = ({ value, onChange }) => {
  return /* @__PURE__ */ React2.createElement(
    Upload,
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
    value ? /* @__PURE__ */ React2.createElement("img", { src: `data:image/png;base64,${value}`, alt: "avatar", style: { width: "100%" } }) : /* @__PURE__ */ React2.createElement("div", null, /* @__PURE__ */ React2.createElement("div", { style: { marginTop: 8 } }, "Upload"))
  );
};

// src/components/Header.tsx
var { Text } = Typography;
var { useToken } = theme2;
var Header = () => {
  const { mutate: logout } = useLogout();
  const { mutate: updatePassword } = useUpdatePassword();
  const { data: user } = useGetIdentity();
  const { mode, setMode } = useColorMode();
  const { token } = useToken();
  const invalidate = useInvalidate();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState2(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState2(false);
  const [photoForm] = Form.useForm();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState2(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState2(false);
  const [passwordForm] = Form.useForm();
  const handlePhotoSubmit = async (values) => {
    if (!user?.id) return;
    setIsPhotoLoading(true);
    try {
      const response = await httpClient(`/odata/ApplicationUser(${user.id})`, {
        method: "PATCH",
        body: JSON.stringify({ Photo: values.Photo })
      });
      if (response && response.ok || response === null) {
        message.success("Photo updated successfully");
        localStorage.setItem("user_photo", values.Photo || "");
        invalidate({ resource: "users", invalidates: ["all"] });
        window.location.reload();
      } else {
        message.error("Failed to update photo");
      }
    } catch (error) {
      message.error("Network error");
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
          message.success("Password changed successfully");
          setIsPasswordModalOpen(false);
          logout();
        },
        onError: (error) => {
          message.error(error?.message || "Failed to change password");
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
      label: /* @__PURE__ */ React3.createElement(Space, { direction: "vertical", size: 0 }, /* @__PURE__ */ React3.createElement(Text, { strong: true }, user?.name)),
      icon: /* @__PURE__ */ React3.createElement(UserOutlined, null),
      disabled: true,
      style: { cursor: "default", color: token.colorText }
    },
    {
      type: "divider"
    },
    {
      key: "change-photo",
      label: "Change Photo",
      icon: /* @__PURE__ */ React3.createElement(CameraOutlined, null),
      onClick: () => {
        photoForm.setFieldsValue({ Photo: user?.avatar?.replace("data:image/png;base64,", "") });
        setIsPhotoModalOpen(true);
      }
    },
    {
      key: "change-password",
      label: "Change Password",
      icon: /* @__PURE__ */ React3.createElement(LockOutlined, null),
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
      icon: mode === "light" ? /* @__PURE__ */ React3.createElement(MoonOutlined, null) : /* @__PURE__ */ React3.createElement(SunOutlined, null),
      onClick: () => setMode(mode === "light" ? "dark" : "light")
    },
    {
      key: "logout",
      label: "Logout",
      icon: /* @__PURE__ */ React3.createElement(LogoutOutlined, null),
      onClick: () => logout()
    }
  ];
  return /* @__PURE__ */ React3.createElement(
    Layout.Header,
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
    /* @__PURE__ */ React3.createElement(Space, null, /* @__PURE__ */ React3.createElement(Dropdown, { menu: { items: menuItems }, trigger: ["click"] }, /* @__PURE__ */ React3.createElement(Button, { type: "text", style: { height: 48 } }, /* @__PURE__ */ React3.createElement(Space, null, /* @__PURE__ */ React3.createElement(Avatar, { src: user?.avatar, alt: user?.name, icon: /* @__PURE__ */ React3.createElement(UserOutlined, null) }), /* @__PURE__ */ React3.createElement(Text, null, user?.name), /* @__PURE__ */ React3.createElement(DownOutlined, { style: { fontSize: 12 } }))))),
    /* @__PURE__ */ React3.createElement(
      Modal,
      {
        title: "Change Photo",
        open: isPhotoModalOpen,
        onCancel: () => setIsPhotoModalOpen(false),
        onOk: () => photoForm.submit(),
        confirmLoading: isPhotoLoading
      },
      /* @__PURE__ */ React3.createElement(Form, { form: photoForm, onFinish: handlePhotoSubmit, layout: "vertical" }, /* @__PURE__ */ React3.createElement(Form.Item, { name: "Photo", label: "Upload Photo" }, /* @__PURE__ */ React3.createElement(Base64Upload, null)))
    ),
    /* @__PURE__ */ React3.createElement(
      Modal,
      {
        title: "Change Password",
        open: isPasswordModalOpen,
        onCancel: () => setIsPasswordModalOpen(false),
        onOk: () => passwordForm.submit(),
        confirmLoading: isPasswordLoading
      },
      /* @__PURE__ */ React3.createElement(Form, { form: passwordForm, onFinish: handlePasswordSubmit, layout: "vertical" }, /* @__PURE__ */ React3.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-end" } }, /* @__PURE__ */ React3.createElement(
        Form.Item,
        {
          name: "password",
          label: "New Password",
          style: { flex: 1, marginBottom: 0 },
          rules: [{ required: true, message: "Please input the new password!" }]
        },
        /* @__PURE__ */ React3.createElement(Input.Password, { placeholder: "Enter new password" })
      ), /* @__PURE__ */ React3.createElement(Button, { icon: /* @__PURE__ */ React3.createElement(ThunderboltOutlined, null), onClick: generatePassword })))
    )
  );
};

// src/components/SmartList.tsx
import React4, { useState as useState3, useEffect as useEffect2 } from "react";
import {
  List,
  useTable
} from "@refinedev/antd";
import { Table, Form as Form2, Input as Input2, Popover, Checkbox, Button as Button2, Space as Space2 } from "antd";
import { SettingOutlined, ReloadOutlined } from "@ant-design/icons";
var SmartList = ({
  children,
  resource,
  searchFields
}) => {
  const { tableProps, searchFormProps, tableQueryResult, queryResult, setFilters } = useTable({
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
  const columns = React4.Children.toArray(children).map((child) => {
    return {
      key: child.props.dataIndex || child.props.title || "unknown",
      title: child.props.title,
      dataIndex: child.props.dataIndex,
      defaultVisible: child.props.defaultVisible
    };
  });
  const [visibleColumns, setVisibleColumns] = useState3([]);
  useEffect2(() => {
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
  const content = /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px" } }, /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" } }, /* @__PURE__ */ React4.createElement("span", { style: { fontWeight: 500 } }, "Select Columns"), /* @__PURE__ */ React4.createElement(Button2, { size: "small", type: "link", onClick: handleResetColumns, style: { padding: 0 } }, "Reset")), columns.filter((col) => col.dataIndex !== "actions").map((col) => /* @__PURE__ */ React4.createElement(
    Checkbox,
    {
      key: col.key,
      checked: visibleColumns.includes(col.key),
      onChange: (e) => handleColumnChange(col.key, e.target.checked)
    },
    col.title || col.dataIndex
  )));
  const filteredChildren = React4.Children.toArray(children).filter((child) => {
    const key = child.props.dataIndex || child.props.title || "unknown";
    return visibleColumns.includes(key);
  }).map((child) => {
    if (child.props.dataIndex) {
      return React4.cloneElement(child, { key: child.props.dataIndex });
    }
    return child;
  });
  return /* @__PURE__ */ React4.createElement(List, null, /* @__PURE__ */ React4.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 20 } }, /* @__PURE__ */ React4.createElement(Form2, { ...searchFormProps, layout: "inline" }, /* @__PURE__ */ React4.createElement(Form2.Item, { name: "search" }, /* @__PURE__ */ React4.createElement(
    Input2.Search,
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
  ))), /* @__PURE__ */ React4.createElement(Space2, null, /* @__PURE__ */ React4.createElement(Button2, { icon: /* @__PURE__ */ React4.createElement(ReloadOutlined, null), onClick: () => (tableQueryResult || queryResult)?.refetch() }, "Refresh"), /* @__PURE__ */ React4.createElement(Popover, { content, title: "Columns", trigger: "click", placement: "bottomRight" }, /* @__PURE__ */ React4.createElement(Button2, { icon: /* @__PURE__ */ React4.createElement(SettingOutlined, null) }, "Columns")))), /* @__PURE__ */ React4.createElement(Table, { ...tableProps, rowKey: "Oid" }, filteredChildren));
};

// src/components/RelatedList.tsx
import React5 from "react";
import { Table as Table2, Button as Button3, Space as Space3, Modal as Modal2, Form as Form3, Input as Input3 } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useModalForm } from "@refinedev/antd";
import { useDelete } from "@refinedev/core";
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
  React5.useEffect(() => {
    if (masterId && form) {
      form.setFieldValue([masterField, "Oid"], masterId);
    }
  }, [masterId, form, masterField]);
  return /* @__PURE__ */ React5.createElement(
    Modal2,
    {
      ...modalProps,
      title: modalTitle,
      width: 600,
      okButtonProps: {
        ...modalProps.okButtonProps,
        "data-testid": `detail-modal-save-btn-${mode}`
      }
    },
    /* @__PURE__ */ React5.createElement(Form3, { ...formProps, layout: "vertical" }, /* @__PURE__ */ React5.createElement(FormFields, { mode }), /* @__PURE__ */ React5.createElement(
      Form3.Item,
      {
        name: [masterField, "Oid"],
        hidden: true
      },
      /* @__PURE__ */ React5.createElement(Input3, null)
    ))
  );
};
var RelatedList = ({
  resource,
  masterField,
  masterId,
  dataSource,
  onMutationSuccess,
  FormFields,
  modalTitle = "Manage Detail",
  children
}) => {
  const createModalForm = useModalForm({
    resource,
    action: "create",
    redirect: false,
    onMutationSuccess
  });
  const editModalForm = useModalForm({
    resource,
    action: "edit",
    redirect: false,
    onMutationSuccess
  });
  const { mutate: deleteMutate } = useDelete();
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
  return /* @__PURE__ */ React5.createElement("div", { className: "shared-detail-list" }, /* @__PURE__ */ React5.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 16 } }, /* @__PURE__ */ React5.createElement(
    Button3,
    {
      type: "primary",
      icon: /* @__PURE__ */ React5.createElement(PlusOutlined, null),
      onClick: () => createModalForm.show(),
      disabled: !masterId,
      "data-testid": "add-detail-btn"
    },
    "Add Detail"
  )), /* @__PURE__ */ React5.createElement(
    Table2,
    {
      dataSource,
      rowKey: "Oid",
      pagination: false,
      bordered: true,
      size: "small"
    },
    children,
    /* @__PURE__ */ React5.createElement(
      Table2.Column,
      {
        title: "Actions",
        key: "actions",
        width: 120,
        render: (_, record) => /* @__PURE__ */ React5.createElement(Space3, null, /* @__PURE__ */ React5.createElement(
          Button3,
          {
            icon: /* @__PURE__ */ React5.createElement(EditOutlined, null),
            size: "small",
            onClick: () => editModalForm.show(record.id ?? record.Oid)
          }
        ), /* @__PURE__ */ React5.createElement(
          Button3,
          {
            icon: /* @__PURE__ */ React5.createElement(DeleteOutlined, null),
            size: "small",
            danger: true,
            onClick: () => handleDelete(record.id ?? record.Oid)
          }
        ))
      }
    )
  ), /* @__PURE__ */ React5.createElement(
    DetailModal,
    {
      modalForm: createModalForm,
      mode: "create",
      modalTitle,
      FormFields,
      masterField,
      masterId
    }
  ), /* @__PURE__ */ React5.createElement(
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
import React6 from "react";
import { useLogin, useTranslate } from "@refinedev/core";
import { Button as Button4, Form as Form4, Input as Input4, Card, Typography as Typography2, Layout as Layout2, theme as theme3, Checkbox as Checkbox2 } from "antd";
import { ThemedTitle } from "@refinedev/antd";
var { Title, Link } = Typography2;
var LoginPage = () => {
  const [form] = Form4.useForm();
  const { mutate: login, isPending } = useLogin();
  const isLoading = isPending;
  const translate = useTranslate();
  const { token } = theme3.useToken();
  const onFinish = async (values) => {
    login(values);
  };
  return /* @__PURE__ */ React6.createElement(
    Layout2,
    {
      style: {
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: token.colorBgContainer
      }
    },
    /* @__PURE__ */ React6.createElement("div", { style: { marginBottom: "24px" } }, /* @__PURE__ */ React6.createElement(
      ThemedTitle,
      {
        collapsed: false,
        wrapperStyles: { fontSize: "22px", justifyContent: "center" }
      }
    )),
    /* @__PURE__ */ React6.createElement(
      Card,
      {
        style: {
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
          boxShadow: "0 4px 24px -4px rgba(0, 0, 0, 0.1)"
        }
      },
      /* @__PURE__ */ React6.createElement("div", { style: { textAlign: "center", marginBottom: "32px" } }, /* @__PURE__ */ React6.createElement(Title, { level: 3, style: { color: token.colorPrimary, margin: 0 } }, translate("pages.login.title", "Sign in to your account"))),
      /* @__PURE__ */ React6.createElement(
        Form4,
        {
          layout: "vertical",
          form,
          onFinish,
          initialValues: {
            remember: false
          }
        },
        /* @__PURE__ */ React6.createElement(
          Form4.Item,
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
          /* @__PURE__ */ React6.createElement(Input4, { size: "large", placeholder: "Username" })
        ),
        /* @__PURE__ */ React6.createElement(
          Form4.Item,
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
          /* @__PURE__ */ React6.createElement(Input4.Password, { size: "large", placeholder: "Password" })
        ),
        /* @__PURE__ */ React6.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px"
            }
          },
          /* @__PURE__ */ React6.createElement(Form4.Item, { name: "remember", valuePropName: "checked", noStyle: true }, /* @__PURE__ */ React6.createElement(Checkbox2, null, translate("pages.login.buttons.rememberMe", "Remember me"))),
          /* @__PURE__ */ React6.createElement(
            Link,
            {
              onClick: () => {
              },
              style: { fontSize: "14px" }
            },
            translate("pages.login.buttons.forgotPassword", "Forgot password?")
          )
        ),
        /* @__PURE__ */ React6.createElement(Form4.Item, null, /* @__PURE__ */ React6.createElement(
          Button4,
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
import React7, { useState as useState4 } from "react";
import { useNotification } from "@refinedev/core";
import { EditButton, DeleteButton } from "@refinedev/antd";
import {
  Table as Table3,
  Checkbox as Checkbox3,
  Space as Space5,
  Button as Button5,
  Modal as Modal3,
  Input as Input5,
  Form as Form5,
  Tooltip
} from "antd";
import { KeyOutlined, ThunderboltOutlined as ThunderboltOutlined2 } from "@ant-design/icons";
var ApplicationUserList = () => {
  const [isModalOpen, setIsModalOpen] = useState4(false);
  const [selectedUser, setSelectedUser] = useState4(null);
  const [form] = Form5.useForm();
  const { open } = useNotification();
  const [isLoading, setIsLoading] = useState4(false);
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
  return /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement(
    SmartList,
    {
      searchFields: ["UserName", "DisplayName", "Email"]
    },
    /* @__PURE__ */ React7.createElement(
      Table3.Column,
      {
        dataIndex: "Photo",
        title: "Photo",
        render: (value) => value ? /* @__PURE__ */ React7.createElement("img", { src: `data:image/png;base64,${value}`, alt: "User", style: { height: 40, width: 40, objectFit: "cover", borderRadius: "50%" } }) : "-"
      }
    ),
    /* @__PURE__ */ React7.createElement(
      Table3.Column,
      {
        dataIndex: "DisplayName",
        title: "Display Name",
        sorter: true,
        defaultSortOrder: "ascend",
        defaultVisible: true
      }
    ),
    /* @__PURE__ */ React7.createElement(
      Table3.Column,
      {
        dataIndex: "UserName",
        title: "User Name",
        sorter: true,
        defaultVisible: true
      }
    ),
    /* @__PURE__ */ React7.createElement(
      Table3.Column,
      {
        dataIndex: "Email",
        title: "Email",
        sorter: true
      }
    ),
    /* @__PURE__ */ React7.createElement(
      Table3.Column,
      {
        dataIndex: "IsActive",
        title: "Active",
        render: (value) => /* @__PURE__ */ React7.createElement(Checkbox3, { checked: value, disabled: true }),
        sorter: true
      }
    ),
    /* @__PURE__ */ React7.createElement(
      Table3.Column,
      {
        dataIndex: "AccessFailedCount",
        title: "Access Failed Count"
      }
    ),
    /* @__PURE__ */ React7.createElement(
      Table3.Column,
      {
        title: "Actions",
        dataIndex: "actions",
        render: (_, record) => /* @__PURE__ */ React7.createElement(Space5, null, /* @__PURE__ */ React7.createElement(Tooltip, { title: "Reset Password" }, /* @__PURE__ */ React7.createElement(
          Button5,
          {
            size: "small",
            icon: /* @__PURE__ */ React7.createElement(KeyOutlined, null),
            onClick: () => handleResetPasswordClick(record)
          }
        )), /* @__PURE__ */ React7.createElement(EditButton, { hideText: true, size: "small", recordItemId: record.Oid }), /* @__PURE__ */ React7.createElement(DeleteButton, { hideText: true, size: "small", recordItemId: record.Oid }))
      }
    )
  ), /* @__PURE__ */ React7.createElement(
    Modal3,
    {
      title: `Reset Password for ${selectedUser?.DisplayName || selectedUser?.UserName}`,
      open: isModalOpen,
      onCancel: () => setIsModalOpen(false),
      onOk: () => form.submit(),
      confirmLoading: isLoading
    },
    /* @__PURE__ */ React7.createElement(Form5, { form, onFinish: handleResetPasswordSubmit, layout: "vertical" }, /* @__PURE__ */ React7.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-end" } }, /* @__PURE__ */ React7.createElement(
      Form5.Item,
      {
        name: "password",
        label: "New Password",
        style: { flex: 1, marginBottom: 0 },
        rules: [{ required: true, message: "Please input the new password!" }]
      },
      /* @__PURE__ */ React7.createElement(Input5.Password, { placeholder: "Enter new password" })
    ), /* @__PURE__ */ React7.createElement(Tooltip, { title: "Generate Complex Password" }, /* @__PURE__ */ React7.createElement(Button5, { icon: /* @__PURE__ */ React7.createElement(ThunderboltOutlined2, null), onClick: generatePassword }))))
  ));
};

// src/pages/application-users/create.tsx
import React8 from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form as Form6, Input as Input6, Checkbox as Checkbox4 } from "antd";
var ApplicationUserCreate = () => {
  const { formProps, saveButtonProps } = useForm();
  return /* @__PURE__ */ React8.createElement(Create, { saveButtonProps }, /* @__PURE__ */ React8.createElement(Form6, { ...formProps, layout: "vertical" }, /* @__PURE__ */ React8.createElement(
    Form6.Item,
    {
      label: "User Name",
      name: "UserName",
      rules: [
        {
          required: true
        }
      ]
    },
    /* @__PURE__ */ React8.createElement(Input6, null)
  ), /* @__PURE__ */ React8.createElement(
    Form6.Item,
    {
      label: "Display Name",
      name: "DisplayName"
    },
    /* @__PURE__ */ React8.createElement(Input6, null)
  ), /* @__PURE__ */ React8.createElement(
    Form6.Item,
    {
      label: "Email",
      name: "Email",
      rules: [
        {
          type: "email"
        }
      ]
    },
    /* @__PURE__ */ React8.createElement(Input6, null)
  ), /* @__PURE__ */ React8.createElement(
    Form6.Item,
    {
      label: "Is Active",
      name: "IsActive",
      valuePropName: "checked",
      initialValue: true
    },
    /* @__PURE__ */ React8.createElement(Checkbox4, null, "Active")
  ), /* @__PURE__ */ React8.createElement(
    Form6.Item,
    {
      label: "Photo",
      name: "Photo"
    },
    /* @__PURE__ */ React8.createElement(Base64Upload, null)
  )));
};

// src/pages/application-users/edit.tsx
import React9 from "react";
import { Edit, useForm as useForm2, useSelect } from "@refinedev/antd";
import { Form as Form7, Input as Input7, Checkbox as Checkbox5, Select, App } from "antd";
var ApplicationUserEdit = () => {
  const { message: message2 } = App.useApp();
  const { formProps, saveButtonProps, id, form } = useForm2({
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
  const { selectProps: roleSelectProps } = useSelect({
    resource: "PermissionPolicyRole",
    optionLabel: "Name",
    optionValue: "Oid"
  });
  const handleOnFinish = (values) => {
    const { Roles, ...userValues } = values;
    formProps.onFinish?.(userValues);
  };
  return /* @__PURE__ */ React9.createElement(Edit, { saveButtonProps }, /* @__PURE__ */ React9.createElement(Form7, { ...formProps, layout: "vertical", onFinish: handleOnFinish }, /* @__PURE__ */ React9.createElement(
    Form7.Item,
    {
      label: "User Name",
      name: "UserName",
      rules: [
        {
          required: true
        }
      ]
    },
    /* @__PURE__ */ React9.createElement(Input7, null)
  ), /* @__PURE__ */ React9.createElement(
    Form7.Item,
    {
      label: "Display Name",
      name: "DisplayName"
    },
    /* @__PURE__ */ React9.createElement(Input7, null)
  ), /* @__PURE__ */ React9.createElement(
    Form7.Item,
    {
      label: "Email",
      name: "Email",
      rules: [
        {
          type: "email"
        }
      ]
    },
    /* @__PURE__ */ React9.createElement(Input7, null)
  ), /* @__PURE__ */ React9.createElement(
    Form7.Item,
    {
      label: "Is Active",
      name: "IsActive",
      valuePropName: "checked"
    },
    /* @__PURE__ */ React9.createElement(Checkbox5, null, "Active")
  ), /* @__PURE__ */ React9.createElement(
    Form7.Item,
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
    /* @__PURE__ */ React9.createElement(Select, { ...roleSelectProps, mode: "multiple" })
  ), /* @__PURE__ */ React9.createElement(
    Form7.Item,
    {
      label: "Photo",
      name: "Photo"
    },
    /* @__PURE__ */ React9.createElement(Base64Upload, null)
  )));
};

// src/pages/roles/list.tsx
import React10 from "react";
import { useTable as useTable2, List as List2, EditButton as EditButton2, DeleteButton as DeleteButton2 } from "@refinedev/antd";
import { Table as Table4, Space as Space6, Checkbox as Checkbox6 } from "antd";
var RoleList = () => {
  const { tableProps } = useTable2({
    syncWithLocation: true
  });
  return /* @__PURE__ */ React10.createElement(List2, null, /* @__PURE__ */ React10.createElement(Table4, { ...tableProps, rowKey: "Oid" }, /* @__PURE__ */ React10.createElement(Table4.Column, { dataIndex: "Name", title: "Name" }), /* @__PURE__ */ React10.createElement(
    Table4.Column,
    {
      dataIndex: "IsAdministrative",
      title: "Is Administrative",
      render: (value) => /* @__PURE__ */ React10.createElement(Checkbox6, { checked: value, disabled: true })
    }
  ), /* @__PURE__ */ React10.createElement(Table4.Column, { dataIndex: "PermissionPolicy", title: "Permission Policy" }), /* @__PURE__ */ React10.createElement(
    Table4.Column,
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => /* @__PURE__ */ React10.createElement(Space6, null, /* @__PURE__ */ React10.createElement(EditButton2, { hideText: true, size: "small", recordItemId: record.Oid }), /* @__PURE__ */ React10.createElement(DeleteButton2, { hideText: true, size: "small", recordItemId: record.Oid }))
    }
  )));
};

// src/pages/roles/create.tsx
import React12 from "react";
import { Create as Create2, useForm as useForm3 } from "@refinedev/antd";
import { Form as Form9, Input as Input8, Checkbox as Checkbox7, Select as Select3 } from "antd";

// src/pages/roles/TypePermissionList.tsx
import React11 from "react";
import { Form as Form8, Select as Select2, Table as Table5 } from "antd";

// src/hooks/useModelTypes.ts
import { useQuery } from "@tanstack/react-query";
var useModelTypes = () => {
  return useQuery({
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
  const PermissionSelect = () => /* @__PURE__ */ React11.createElement(
    Select2,
    {
      allowClear: true,
      options: [
        { label: "Allow", value: "Allow" /* Allow */ },
        { label: "Deny", value: "Deny" /* Deny */ }
      ]
    }
  );
  return /* @__PURE__ */ React11.createElement(
    RelatedList,
    {
      resource: "PermissionPolicyTypePermissions",
      masterField: "Role",
      dataSource,
      modalTitle: "Type Permission",
      FormFields: ({ mode }) => /* @__PURE__ */ React11.createElement(React11.Fragment, null, /* @__PURE__ */ React11.createElement(
        Form8.Item,
        {
          label: "Target Type",
          name: "TargetType",
          rules: [{ required: true }]
        },
        /* @__PURE__ */ React11.createElement(
          Select2,
          {
            showSearch: true,
            options: typeOptions,
            filterOption: (input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        )
      ), /* @__PURE__ */ React11.createElement(Form8.Item, { label: "Read State", name: "ReadState" }, /* @__PURE__ */ React11.createElement(PermissionSelect, null)), /* @__PURE__ */ React11.createElement(Form8.Item, { label: "Write State", name: "WriteState" }, /* @__PURE__ */ React11.createElement(PermissionSelect, null)), /* @__PURE__ */ React11.createElement(Form8.Item, { label: "Create State", name: "CreateState" }, /* @__PURE__ */ React11.createElement(PermissionSelect, null)), /* @__PURE__ */ React11.createElement(Form8.Item, { label: "Delete State", name: "DeleteState" }, /* @__PURE__ */ React11.createElement(PermissionSelect, null)), /* @__PURE__ */ React11.createElement(Form8.Item, { label: "Navigate State", name: "NavigateState" }, /* @__PURE__ */ React11.createElement(PermissionSelect, null)))
    },
    /* @__PURE__ */ React11.createElement(Table5.Column, { dataIndex: "TargetType", title: "Target Type" }),
    /* @__PURE__ */ React11.createElement(Table5.Column, { dataIndex: "ReadState", title: "Read" }),
    /* @__PURE__ */ React11.createElement(Table5.Column, { dataIndex: "WriteState", title: "Write" }),
    /* @__PURE__ */ React11.createElement(Table5.Column, { dataIndex: "CreateState", title: "Create" }),
    /* @__PURE__ */ React11.createElement(Table5.Column, { dataIndex: "DeleteState", title: "Delete" }),
    /* @__PURE__ */ React11.createElement(Table5.Column, { dataIndex: "NavigateState", title: "Navigate" })
  );
};

// src/pages/roles/create.tsx
var RoleCreate = () => {
  const [form] = Form9.useForm();
  const { formProps, saveButtonProps } = useForm3();
  const handleSave = () => {
    form.submit();
  };
  return /* @__PURE__ */ React12.createElement(Create2, { saveButtonProps: { ...saveButtonProps, onClick: handleSave } }, /* @__PURE__ */ React12.createElement(
    Form9,
    {
      ...formProps,
      form,
      layout: "vertical",
      onFinish: (values) => {
        return formProps.onFinish && formProps.onFinish(values);
      }
    },
    /* @__PURE__ */ React12.createElement(
      Form9.Item,
      {
        label: "Name",
        name: "Name",
        rules: [{ required: true }]
      },
      /* @__PURE__ */ React12.createElement(Input8, null)
    ),
    /* @__PURE__ */ React12.createElement(
      Form9.Item,
      {
        label: "Is Administrative",
        name: "IsAdministrative",
        valuePropName: "checked"
      },
      /* @__PURE__ */ React12.createElement(Checkbox7, null, "Is Administrative")
    ),
    /* @__PURE__ */ React12.createElement(
      Form9.Item,
      {
        label: "Permission Policy",
        name: "PermissionPolicy",
        initialValue: "DenyAllByDefault" /* DenyAllByDefault */,
        rules: [{ required: true }]
      },
      /* @__PURE__ */ React12.createElement(
        Select3,
        {
          options: [
            { label: "Deny All By Default", value: "DenyAllByDefault" /* DenyAllByDefault */ },
            { label: "Read Only All By Default", value: "ReadOnlyAllByDefault" /* ReadOnlyAllByDefault */ },
            { label: "Allow All By Default", value: "AllowAllByDefault" /* AllowAllByDefault */ }
          ]
        }
      )
    ),
    /* @__PURE__ */ React12.createElement(TypePermissionList, null)
  ));
};

// src/pages/roles/edit.tsx
import React13 from "react";
import { Edit as Edit2, useForm as useForm4 } from "@refinedev/antd";
import { Form as Form10, Input as Input9, Checkbox as Checkbox8, Select as Select4 } from "antd";
var RoleEdit = () => {
  const [form] = Form10.useForm();
  const { formProps, saveButtonProps } = useForm4({
    meta: {
      expand: [
        { field: "TypePermissions" }
      ]
    }
  });
  const handleSave = () => {
    form.submit();
  };
  React13.useEffect(() => {
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
  return /* @__PURE__ */ React13.createElement(Edit2, { saveButtonProps: { ...saveButtonProps, onClick: handleSave } }, /* @__PURE__ */ React13.createElement(
    Form10,
    {
      ...formProps,
      form,
      layout: "vertical",
      onFinish: (values) => {
        return formProps.onFinish && formProps.onFinish(values);
      }
    },
    /* @__PURE__ */ React13.createElement(
      Form10.Item,
      {
        label: "Name",
        name: "Name",
        rules: [{ required: true }]
      },
      /* @__PURE__ */ React13.createElement(Input9, null)
    ),
    /* @__PURE__ */ React13.createElement(
      Form10.Item,
      {
        label: "Is Administrative",
        name: "IsAdministrative",
        valuePropName: "checked"
      },
      /* @__PURE__ */ React13.createElement(Checkbox8, null, "Is Administrative")
    ),
    /* @__PURE__ */ React13.createElement(
      Form10.Item,
      {
        label: "Permission Policy",
        name: "PermissionPolicy",
        rules: [{ required: true }]
      },
      /* @__PURE__ */ React13.createElement(
        Select4,
        {
          options: [
            { label: "Deny All By Default", value: "DenyAllByDefault" /* DenyAllByDefault */ },
            { label: "Read Only All By Default", value: "ReadOnlyAllByDefault" /* ReadOnlyAllByDefault */ },
            { label: "Allow All By Default", value: "AllowAllByDefault" /* AllowAllByDefault */ }
          ]
        }
      )
    ),
    /* @__PURE__ */ React13.createElement(TypePermissionList, null)
  ));
};
export {
  ApplicationUserCreate,
  ApplicationUserEdit,
  ApplicationUserList,
  Base64Upload,
  ColorModeContext,
  ColorModeContextProvider,
  Header,
  HttpError,
  LoginPage,
  RelatedList,
  RoleCreate,
  RoleEdit,
  RoleList,
  SecurityPermissionPolicy,
  SecurityPermissionState,
  SmartList,
  TOKEN_KEY,
  authProvider,
  authService,
  dataProvider,
  getBaseUrl,
  httpClient,
  parseJwt,
  useColorMode,
  useModelTypes
};
