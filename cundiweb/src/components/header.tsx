import React, { useState } from "react";
import { useLogout, useGetIdentity, useInvalidate, useUpdatePassword } from "@refinedev/core";
import { Layout, Button, Space, Typography, Avatar, theme, Dropdown, MenuProps, Modal, Form, Input, message } from "antd";
import { LogoutOutlined, UserOutlined, DownOutlined, SkinOutlined, SunOutlined, MoonOutlined, CameraOutlined, LockOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useColorMode } from "../contexts/color-mode";
import { Base64Upload } from "./Base64Upload";
import { TOKEN_KEY } from "../authProvider";

const { Text } = Typography;
const { useToken } = theme;

export const Header: React.FC = () => {
    const { mutate: logout } = useLogout();
    const { mutate: updatePassword } = useUpdatePassword();
    const { data: user } = useGetIdentity();
    const { mode, setMode } = useColorMode();
    const { token } = useToken();
    const invalidate = useInvalidate();

    // Photo Modal State
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [isPhotoLoading, setIsPhotoLoading] = useState(false);
    const [photoForm] = Form.useForm();

    // Password Modal State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordForm] = Form.useForm();

    const handlePhotoSubmit = async (values: { Photo: string }) => {
        if (!user?.id) return;
        setIsPhotoLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/odata/ApplicationUser(${user.id})`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`
                },
                body: JSON.stringify({ Photo: values.Photo })
            });

            if (response.ok) {
                message.success("Photo updated successfully");
                localStorage.setItem("user_photo", values.Photo || "");
                invalidate({ resource: "users", invalidates: ["all"] }); // Trigger refresh if needed, but manual LS update works for getIdentity
                window.location.reload(); // Simple reload to refresh getIdentity if hooks don't pick up LS change immediately
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

    const handlePasswordSubmit = async (values: { password: string }) => {
        setIsPasswordLoading(true);
        updatePassword(
            { password: values.password },
            {
                onSuccess: () => {
                    message.success("Password changed successfully");
                    setIsPasswordModalOpen(false);
                    // logout(); // updatePassword will redirect to login page based on authProvider impl, but we can also force logout if needed. 
                    // However, useLogout hook is cleaner. But let's see. 
                    // authProvider.updatePassword returns success:true, redirectTo: "/login".
                    // Refine might automatically redirect. Let's rely on provider's redirect action.
                    // But to be safe and consistent with previous behavior (force logout), we can call logout() here too.
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

    const menuItems: MenuProps["items"] = [
        {
            key: "user-info",
            label: (
                <Space direction="vertical" size={0}>
                    <Text strong>{user?.name}</Text>
                    {/* <Text type="secondary" style={{ fontSize: 12 }}>Admin</Text> */}
                </Space>
            ),
            icon: <UserOutlined />,
            disabled: true,
            style: { cursor: "default", color: token.colorText },
        },
        {
            type: "divider",
        },
        {
            key: "change-photo",
            label: "Change Photo",
            icon: <CameraOutlined />,
            onClick: () => {
                photoForm.setFieldsValue({ Photo: user?.avatar?.replace("data:image/png;base64,", "") });
                setIsPhotoModalOpen(true);
            },
        },
        {
            key: "change-password",
            label: "Change Password",
            icon: <LockOutlined />,
            onClick: () => {
                passwordForm.resetFields();
                setIsPasswordModalOpen(true);
            },
        },
        {
            type: "divider",
        },
        {
            key: "theme",
            label: mode === "light" ? "Dark Theme" : "Light Theme",
            icon: mode === "light" ? <MoonOutlined /> : <SunOutlined />,
            onClick: () => setMode(mode === "light" ? "dark" : "light"),
        },
        {
            key: "logout",
            label: "Logout",
            icon: <LogoutOutlined />,
            onClick: () => logout(),
        }
    ];

    return (
        <Layout.Header
            style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "0 24px",
                height: "64px",
                backgroundColor: token.colorBgElevated,
                position: "sticky",
                top: 0,
                zIndex: 1,
            }}
        >
            <Space>
                <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                    <Button type="text" style={{ height: 48 }}>
                        <Space>
                            <Avatar src={user?.avatar} alt={user?.name} icon={<UserOutlined />} />
                            <Text>{user?.name}</Text>
                            <DownOutlined style={{ fontSize: 12 }} />
                        </Space>
                    </Button>
                </Dropdown>
            </Space>

            {/* Photo Modal */}
            <Modal
                title="Change Photo"
                open={isPhotoModalOpen}
                onCancel={() => setIsPhotoModalOpen(false)}
                onOk={() => photoForm.submit()}
                confirmLoading={isPhotoLoading}
            >
                <Form form={photoForm} onFinish={handlePhotoSubmit} layout="vertical">
                    <Form.Item name="Photo" label="Upload Photo">
                        <Base64Upload />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Password Modal */}
            <Modal
                title="Change Password"
                open={isPasswordModalOpen}
                onCancel={() => setIsPasswordModalOpen(false)}
                onOk={() => passwordForm.submit()}
                confirmLoading={isPasswordLoading}
            >
                <Form form={passwordForm} onFinish={handlePasswordSubmit} layout="vertical">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <Form.Item
                            name="password"
                            label="New Password"
                            style={{ flex: 1, marginBottom: 0 }}
                            rules={[{ required: true, message: 'Please input the new password!' }]}
                        >
                            <Input.Password placeholder="Enter new password" />
                        </Form.Item>
                        <Button icon={<ThunderboltOutlined />} onClick={generatePassword} />
                    </div>
                </Form>
            </Modal>
        </Layout.Header>
    );
};
