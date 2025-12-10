import { DataProvider } from "@refinedev/core";
import { TOKEN_KEY } from "./authProvider";

// Simple OData V4 Provider for Refine
// Assumes XAF OData endpoint structure
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
                    // LogicalFilter
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
                    // Add more operators as needed
                } else {
                    // ConditionalFilter
                    const { operator, value } = filter;
                    const nestedFilters = value.map((f: any) => {
                        if (f.operator === "contains") {
                            return `contains(${f.field}, '${f.value}')`;
                        }
                        // Simplified recursive or direct mapping 
                        // Note: Ideally this should be fully recursive, but for shared search (OR) logic:
                        return `${f.field} eq '${f.value}'`;
                    });

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

        const response = await fetch(url.toString(), {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        });

        if (!response.ok) {
            const error: any = new Error(response.statusText);
            error.statusCode = response.status;
            throw error;
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

        const response = await fetch(url.toString(), {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        });
        if (!response.ok) {
            const error: any = new Error(response.statusText);
            error.statusCode = response.status;
            throw error;
        }
        const data = await response.json();
        return { data: { ...data, id: data.Oid } };
    },

    create: async ({ resource, variables }) => {
        const response = await fetch(`${apiUrl}/${resource}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify(variables),
        });
        if (!response.ok) {
            const error: any = new Error(response.statusText);
            error.statusCode = response.status;
            throw error;
        }
        const data = await response.json();
        return { data };
    },

    update: async ({ resource, id, variables }) => {
        // Special handling for Role updates to support nested TypePermissions
        if (resource === "PermissionPolicyRole") {
            const apiBase = apiUrl.endsWith('/odata') ? apiUrl.substring(0, apiUrl.length - 6) : apiUrl;

            const response = await fetch(`${apiBase}/Role/UpdateRole`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`
                },
                body: JSON.stringify({ ...variables, Oid: id }),
            });
            if (!response.ok) {
                const error: any = new Error(response.statusText);
                error.statusCode = response.status;
                throw error;
            }
            const data = await response.json();
            return { data: { ...variables, id } as any };
        }

        const response = await fetch(`${apiUrl}/${resource}(${id})`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify(variables),
        });
        if (!response.ok) {
            const error: any = new Error(response.statusText);
            error.statusCode = response.status;
            throw error;
        }
        // OData PATCH might return 204 No Content
        if (response.status === 204) {
            return { data: { id, ...variables } as any };
        }
        const data = await response.json();
        return { data };
    },

    deleteOne: async ({ resource, id }) => {
        const response = await fetch(`${apiUrl}/${resource}(${id})`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        });
        if (!response.ok) {
            const error: any = new Error(response.statusText);
            error.statusCode = response.status;
            throw error;
        }
        return { data: { id } as any };
    },

    getApiUrl: () => apiUrl,

    // Optional methods can be implemented if needed
    getMany: async () => { throw new Error("Not implemented"); },
    createMany: async () => { throw new Error("Not implemented"); },
    deleteMany: async () => { throw new Error("Not implemented"); },
    updateMany: async () => { throw new Error("Not implemented"); },
    custom: async () => { throw new Error("Not implemented"); },
});
