import { DataProvider } from "@refinedev/core";
import { httpClient } from "./utils/httpClient";

// Simple OData V4 Provider for Refine
export const dataProvider = (apiUrl: string): DataProvider => ({
    getList: async ({ resource, pagination, sorters, filters }) => {
        const url = new URL(`${apiUrl}/${resource}`);

        // Pagination
        if (pagination) {
            const { current, pageSize } = pagination as any;
            if (current && pageSize) {
                url.searchParams.append("$skip", ((current - 1) * pageSize).toString());
                url.searchParams.append("$top", pageSize.toString());
            }
        }

        // Sorting
        if (sorters && sorters.length > 0) {
            const sort = sorters.map(s => `${s.field} ${s.order}`).join(",");
            url.searchParams.append("$orderby", sort);
        }

        // Filters
        if (filters && filters.length > 0) {
            const filterStrings = filters.map(filter => {
                if ("field" in filter) {
                    const { field, operator, value } = filter;
                    if (operator === "eq") {
                        const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value?.toString());
                        if (isGuid) {
                            return `${field} eq ${value}`;
                        }
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
                    // ConditionalFilter
                    const { operator, value } = filter;
                    // Specifically handling the search case which usually comes as an 'or' conditional filter
                    if (operator === "or") {
                        return `(${value.map((f: any) => `contains(${f.field}, '${f.value}')`).join(" or ")})`;
                    }
                }
                return "";
            }).filter(f => f);

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
            data: data.value.map((item: any) => ({ ...item, id: item.Oid })),
            total: data["@odata.count"] || data.value.length,
        };
    },

    getOne: async ({ resource, id, meta }) => {
        const url = new URL(`${apiUrl}/${resource}(${id})`);

        if (meta?.expand) {
            const expand = meta.expand.map((item: any) => item.field ?? item).join(",");
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
            body: JSON.stringify(variables),
        });
        if (!response) throw new Error("Create failed with no response");

        const data = await response.json();
        return { data };
    },

    update: async ({ resource, id, variables }) => {
        // Special handling for Role updates from app logic is removed here to make it generic.
        // OR we can keep it if we decide this SDK is specifically for this application domain.
        // Since user asked for XAF integration, the Role/TypePermission structure IS generic to XAF Security System.
        // So we keep it.



        const response = await httpClient(`${apiUrl}/${resource}(${id})`, {
            method: "PATCH",
            body: JSON.stringify(variables),
        });

        if (!response) { // 204
            return { data: { id, ...variables } as any };
        }

        const data = await response.json();
        return { data };
    },

    deleteOne: async ({ resource, id }) => {
        await httpClient(`${apiUrl}/${resource}(${id})`, {
            method: "DELETE",
        });
        return { data: { id } as any };
    },

    getApiUrl: () => apiUrl,

    getMany: async () => { throw new Error("Not implemented"); },
    createMany: async () => { throw new Error("Not implemented"); },
    deleteMany: async () => { throw new Error("Not implemented"); },
    updateMany: async () => { throw new Error("Not implemented"); },
    custom: async () => { throw new Error("Not implemented"); },
});
