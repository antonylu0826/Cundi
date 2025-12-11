
import React from "react";
import { Table, Button, Space, Modal, Form, Input } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useModalForm, UseModalFormReturnType } from "@refinedev/antd";
import { useDelete, BaseRecord, HttpError } from "@refinedev/core";

// --- Extracted Modal Component (Stable) ---
interface DetailModalProps<TItem extends BaseRecord> {
    modalForm: UseModalFormReturnType<TItem, HttpError, TItem>;
    mode: "create" | "edit";
    modalTitle: string;
    FormFields: React.FC<{ mode: "create" | "edit" }>;
    masterField: string;
    masterId?: string;
}

const DetailModal = <TItem extends BaseRecord>({
    modalForm,
    mode,
    modalTitle,
    FormFields,
    masterField,
    masterId,
}: DetailModalProps<TItem>) => {
    const { modalProps, formProps } = modalForm;
    const { form } = formProps;

    React.useEffect(() => {
        if (masterId && form) {
            form.setFieldValue([masterField, "Oid"] as any, masterId);
        }
    }, [masterId, form, masterField]);

    return (
        <Modal
            {...modalProps}
            title={modalTitle}
            width={600}
            okButtonProps={{
                ...modalProps.okButtonProps,
                "data-testid": `detail-modal-save-btn-${mode}`
            } as any}
        >
            <Form {...formProps} layout="vertical">
                {/* Render User Fields */}
                <FormFields mode={mode} />

                {/* Hidden Link to Master */}
                <Form.Item
                    name={[masterField, "Oid"]}
                    hidden
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// --- Main Shared Component ---
interface SharedDetailListProps<TItem extends BaseRecord> {
    resource: string;
    /** Field name in the detail object that links to master (e.g. "Master") */
    masterField: string;
    /** ID of the master record */
    masterId?: string;
    /** Data source for the table */
    dataSource?: TItem[];
    /** Callback when data changes (save/delete) to refresh parent */
    onMutationSuccess?: () => void;
    /** Function component to render form fields. Receives 'mode' prop. */
    FormFields: React.FC<{ mode: "create" | "edit" }>;
    /** Title for the modal, defaults to "Manage Detail" */
    modalTitle?: string;
    /** Extra props for the Table */
    children?: React.ReactNode;
}

export const SharedDetailList = <TItem extends BaseRecord>({
    resource,
    masterField,
    masterId,
    dataSource,
    onMutationSuccess,
    FormFields,
    modalTitle = "Manage Detail",
    children,
}: SharedDetailListProps<TItem>) => {

    // --- Create Modal ---
    const createModalForm = useModalForm<TItem, HttpError, TItem>({
        resource,
        action: "create",
        redirect: false,
        onMutationSuccess,
    });

    // --- Edit Modal ---
    const editModalForm = useModalForm<TItem, HttpError, TItem>({
        resource,
        action: "edit",
        redirect: false,
        onMutationSuccess,
    });

    const { mutate: deleteMutate } = useDelete();

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this detail?")) {
            deleteMutate({
                resource,
                id,
                mutationMode: "optimistic",
            }, {
                onSuccess: onMutationSuccess
            });
        }
    };

    return (
        <div className="shared-detail-list">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                    disabled={!masterId}
                    data-testid="add-detail-btn"
                >
                    Add Detail
                </Button>
            </div>

            <Table
                dataSource={dataSource}
                rowKey="Oid"
                pagination={false}
                bordered
                size="small"
            >
                {children}

                <Table.Column
                    title="Actions"
                    key="actions"
                    width={120}
                    render={(_, record: TItem) => (
                        <Space>
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => editModalForm.show(record.id as any ?? (record as any).Oid)}
                            />
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                onClick={() => handleDelete(record.id as any ?? (record as any).Oid)}
                            />
                        </Space>
                    )}
                />
            </Table>

            {/* Modals using Extracted Component */}
            <DetailModal
                modalForm={createModalForm}
                mode="create"
                modalTitle={modalTitle}
                FormFields={FormFields}
                masterField={masterField}
                masterId={masterId}
            />
            <DetailModal
                modalForm={editModalForm}
                mode="edit"
                modalTitle={modalTitle}
                FormFields={FormFields}
                masterField={masterField}
                masterId={masterId}
            />
        </div>
    );
};
