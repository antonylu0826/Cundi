
import React, { useState } from "react";
import { IResourceComponentsProps, BaseRecord, useNotification } from "@refinedev/core";
import { EditButton, DeleteButton } from "@refinedev/antd";
import {
    Table,
    Checkbox,
    Space,
    Button,
    Modal,
    Input,
    Form,
    Tooltip
} from "antd";
import { KeyOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { SharedList } from "../../components/SharedList";
import { IApplicationUser } from "../../interfaces";
import { TOKEN_KEY } from "../../authProvider";

export const ApplicationUserList: React.FC<IResourceComponentsProps> = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IApplicationUser | null>(null);
    const [form] = Form.useForm();
    const { open } = useNotification();
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPasswordClick = (user: IApplicationUser) => {
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

    const handleResetPasswordSubmit = async (values: { password: string }) => {
        if (!selectedUser) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/User/ResetPassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`
                },
                body: JSON.stringify({
                    userId: selectedUser.Oid,
                    newPassword: values.password
                })
            });

            if (response.ok) {
                open({
                    type: "success",
                    message: "Success",
                    description: "Password reset successfully",
                });
                setIsModalOpen(false);
            } else {
                open({
                    type: "error",
                    message: "Error",
                    description: "Failed to reset password",
                });
            }
        } catch (error) {
            open({
                type: "error",
                message: "Error",
                description: "Network error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SharedList<IApplicationUser>
                searchFields={["UserName", "DisplayName", "Email"]}
            >
                <Table.Column
                    dataIndex="Photo"
                    title="Photo"
                    render={(value: string) => (
                        value ? <img src={`data:image/png;base64,${value}`} alt="User" style={{ height: 40, width: 40, objectFit: 'cover', borderRadius: '50%' }} /> : '-'
                    )}
                />
                <Table.Column
                    dataIndex="DisplayName"
                    title="Display Name"
                    sorter
                    defaultSortOrder="ascend"
                    // @ts-ignore
                    defaultVisible
                />
                <Table.Column
                    dataIndex="UserName"
                    title="User Name"
                    sorter
                    // @ts-ignore
                    defaultVisible
                />
                <Table.Column
                    dataIndex="Email"
                    title="Email"
                    sorter
                />
                <Table.Column
                    dataIndex="IsActive"
                    title="Active"
                    render={(value: boolean) => <Checkbox checked={value} disabled />}
                    sorter
                />
                <Table.Column
                    dataIndex="AccessFailedCount"
                    title="Access Failed Count"
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <Tooltip title="Reset Password">
                                <Button
                                    size="small"
                                    icon={<KeyOutlined />}
                                    onClick={() => handleResetPasswordClick(record as IApplicationUser)}
                                />
                            </Tooltip>
                            <EditButton hideText size="small" recordItemId={record.Oid} />
                            <DeleteButton hideText size="small" recordItemId={record.Oid} />
                        </Space>
                    )}
                />
            </SharedList>

            <Modal
                title={`Reset Password for ${selectedUser?.DisplayName || selectedUser?.UserName}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isLoading}
            >
                <Form form={form} onFinish={handleResetPasswordSubmit} layout="vertical">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <Form.Item
                            name="password"
                            label="New Password"
                            style={{ flex: 1, marginBottom: 0 }}
                            rules={[{ required: true, message: 'Please input the new password!' }]}
                        >
                            <Input.Password placeholder="Enter new password" />
                        </Form.Item>
                        <Tooltip title="Generate Complex Password">
                            <Button icon={<ThunderboltOutlined />} onClick={generatePassword} />
                        </Tooltip>
                    </div>
                </Form>
            </Modal>
        </>
    );
};
