
import React from "react";
import { useLogin, useTranslate } from "@refinedev/core";
import { Button, Form, Input, Card, Typography, Layout, theme, Checkbox, Space } from "antd/lib";
import { ThemedTitle } from "@refinedev/antd";

const { Title, Link } = Typography;

export const LoginPage: React.FC = () => {
    const [form] = Form.useForm();
    const { mutate: login, isPending } = useLogin<any>();
    const isLoading = isPending;
    const translate = useTranslate();
    const { token } = theme.useToken();

    const onFinish = async (values: any) => {
        login(values);
    };

    return (
        <Layout
            style={{
                height: "100vh",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: token.colorBgContainer,
            }}
        >
            <div style={{ marginBottom: "24px" }}>
                <ThemedTitle
                    collapsed={false}
                    wrapperStyles={{ fontSize: "22px", justifyContent: "center" }}
                />
            </div>

            <Card
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "20px",
                    boxShadow: "0 4px 24px -4px rgba(0, 0, 0, 0.1)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <Title level={3} style={{ color: token.colorPrimary, margin: 0 }}>
                        {translate("pages.login.title", "Sign in to your account")}
                    </Title>
                </div>

                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    initialValues={{
                        remember: false,
                    }}
                >
                    <Form.Item
                        label={translate("pages.login.fields.username", "Username")}
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: translate(
                                    "pages.login.errors.requiredUsername",
                                    "Please input your username"
                                ),
                            },
                        ]}
                    >
                        <Input size="large" placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        label={translate("pages.login.fields.password", "Password")}
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: translate(
                                    "pages.login.errors.requiredPassword",
                                    "Please input your password"
                                ),
                            },
                        ]}
                    >
                        <Input.Password size="large" placeholder="Password" />
                    </Form.Item>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "24px",
                        }}
                    >
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>
                                {translate("pages.login.buttons.rememberMe", "Remember me")}
                            </Checkbox>
                        </Form.Item>
                        <Link
                            onClick={() => { }}
                            style={{ fontSize: "14px" }}
                        >
                            {translate("pages.login.buttons.forgotPassword", "Forgot password?")}
                        </Link>
                    </div>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            block
                            size="large"
                        >
                            {translate("pages.login.signin", "Sign in")}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Layout>
    );
};
