
import React, { useState, useEffect } from "react";
import {
    List,
    useTable,
} from "@refinedev/antd";
import { Table, Form, Input, Popover, Checkbox, Button, Space } from "antd";
import { SettingOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { BaseRecord, HttpError, CrudFilters } from "@refinedev/core";


interface SmartListProps {
    children?: React.ReactNode;
    resource?: string;
    searchFields?: string[];
}

export const SmartList = <T extends BaseRecord = BaseRecord>({
    children,
    resource,
    searchFields,
}: SmartListProps) => {
    // @ts-ignore
    const { tableProps, searchFormProps, tableQueryResult, queryResult, setFilters } = useTable<T, HttpError, { search: string }>({
        resource,
        syncWithLocation: true,
        onSearch: (params) => {
            const filters: CrudFilters = [];
            const { search } = params;

            if (search && searchFields && searchFields.length > 0) {
                filters.push({
                    operator: "or",
                    value: searchFields.map(field => ({
                        field,
                        operator: "contains",
                        value: search,
                    }))
                });
            }
            return filters;
        }
    });

    // Detect available columns from children
    const columns = React.Children.toArray(children).map((child: any) => {
        return {
            key: child.props.dataIndex || child.props.title || "unknown",
            title: child.props.title,
            dataIndex: child.props.dataIndex,
            defaultVisible: child.props.defaultVisible,
        };
    });

    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    useEffect(() => {
        const allKeys = columns.map(c => c.key?.toString());
        const storageKey = `table-columns-${resource}`;
        const saved = localStorage.getItem(storageKey);

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure saved columns still exist
                const validSaved = parsed.filter((k: string) => allKeys.includes(k));
                if (validSaved.length > 0) {
                    setVisibleColumns(validSaved);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse saved columns", e);
            }
        }

        // Default to columns marked as defaultVisible or 'actions'
        const defaultVisible = columns
            .filter(c => c.defaultVisible || c.dataIndex === 'actions')
            .map(c => c.key?.toString());
        setVisibleColumns(defaultVisible);
    }, [children, resource]);

    const handleColumnChange = (key: string, checked: boolean) => {
        let newVisible: string[];
        if (checked) {
            newVisible = [...visibleColumns, key];
        } else {
            newVisible = visibleColumns.filter(k => k !== key);
        }
        setVisibleColumns(newVisible);
        localStorage.setItem(`table-columns-${resource}`, JSON.stringify(newVisible));
    };

    const handleResetColumns = () => {
        const defaultVisible = columns
            .filter(c => c.defaultVisible || c.dataIndex === 'actions')
            .map(c => c.key?.toString());
        setVisibleColumns(defaultVisible);
        localStorage.removeItem(`table-columns-${resource}`);
    };

    const content = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 500 }}>Select Columns</span>
                <Button size="small" type="link" onClick={handleResetColumns} style={{ padding: 0 }}>
                    Reset
                </Button>
            </div>
            {columns.filter((col: any) => col.dataIndex !== 'actions').map((col: any) => (
                <Checkbox
                    key={col.key}
                    checked={visibleColumns.includes(col.key)}
                    onChange={(e) => handleColumnChange(col.key, e.target.checked)}
                >
                    {col.title || col.dataIndex}
                </Checkbox>
            ))}
        </div>
    );

    const filteredChildren = React.Children.toArray(children).filter((child: any) => {
        const key = child.props.dataIndex || child.props.title || "unknown";
        return visibleColumns.includes(key);
    }).map((child: any) => {
        if (child.props.dataIndex) {
            return React.cloneElement(child, { key: child.props.dataIndex });
        }
        return child;
    });

    return (
        <List>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Form {...searchFormProps} layout="inline">
                    <Form.Item name="search">
                        <Input
                            placeholder="Search..."
                            style={{ width: 300 }}
                            allowClear
                            suffix={
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<SearchOutlined />}
                                    style={{ border: 0, background: 'transparent', margin: 0, height: 24, width: 24 }}
                                    onClick={() => {
                                        const value = searchFormProps.form?.getFieldValue("search");
                                        if (!value) {
                                            window.location.search = "";
                                        } else {
                                            searchFormProps.onFinish?.({ search: value });
                                        }
                                    }}
                                />
                            }
                            onPressEnter={(e) => {
                                const value = e.currentTarget.value;
                                if (!value) {
                                    window.location.search = "";
                                } else {
                                    searchFormProps.onFinish?.({ search: value });
                                }
                            }}
                        />
                    </Form.Item>
                </Form>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => (tableQueryResult || queryResult)?.refetch()}>Refresh</Button>
                    <Popover content={content} title="Columns" trigger="click" placement="bottomRight">
                        <Button icon={<SettingOutlined />}>Columns</Button>
                    </Popover>
                </Space>
            </div>

            <Table {...tableProps} rowKey="Oid">
                {filteredChildren}
            </Table>
        </List>
    );
};
