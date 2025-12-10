import { useLogout, useGetIdentity } from "@refinedev/core";
import { Layout, Button, Space, Typography, Avatar, theme, Dropdown, MenuProps } from "antd";
import { LogoutOutlined, UserOutlined, DownOutlined, SkinOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useColorMode } from "../contexts/color-mode";

const { Text } = Typography;
const { useToken } = theme;

export const Header: React.FC = () => {
    const { mutate: logout } = useLogout();
    const { data: user } = useGetIdentity();
    const { mode, setMode } = useColorMode();
    const { token } = useToken();

    const menuItems: MenuProps["items"] = [
        {
            key: "user-info",
            label: (
                <Space direction="vertical" size={0}>
                    <Text strong>{user?.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Admin</Text>
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
            key: "theme",
            label: mode === "light" ? "Dark Theme" : "Light Theme",
            icon: mode === "light" ? <MoonOutlined /> : <SunOutlined />,
            onClick: () => setMode(mode === "light" ? "dark" : "light"),
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            label: "Logout",
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => logout(),
        },
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
        </Layout.Header>
    );
};
