import { DataProvider } from "@refinedev/core";
import { httpClient } from "./utils/httpClient";
import { generateFilterString } from "./utils/generateFilter";

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
        const filterString = generateFilterString(filters);
        if (filterString) {
            url.searchParams.append("$filter", filterString);
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

    getMany: async ({ resource, ids }) => {
        const url = new URL(`${apiUrl}/${resource}`);

        const filter = ids.map(id => {
            const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.toString());
            return `Oid eq ${isGuid ? id : `'${id}'`}`;
        }).join(" or ");

        url.searchParams.append("$filter", filter);

        const response = await httpClient(url.toString());
        if (!response) {
            return { data: [] };
        }
        const data = await response.json();

        return {
            data: data.value.map((item: any) => ({ ...item, id: item.Oid })),
        };
    },

    createMany: async () => { throw new Error("Not implemented"); },
    deleteMany: async () => { throw new Error("Not implemented"); },
    updateMany: async () => { throw new Error("Not implemented"); },

    custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
        let requestUrl = new URL(`${url.startsWith("http") ? url : `${apiUrl}${url}`}`);

        if (filters) {
            const filterString = generateFilterString(filters);
            if (filterString) {
                requestUrl.searchParams.append("$filter", filterString);
            }
        }

        if (sorters && sorters.length > 0) {
            const sort = sorters.map(s => `${s.field} ${s.order}`).join(",");
            requestUrl.searchParams.append("$orderby", sort);
        }

        if (query) {
            Object.keys(query).forEach(key => {
                requestUrl.searchParams.append(key, query[key]);
            });
        }

        const response = await httpClient(requestUrl.toString(), {
            method,
            headers: headers as any,
            body: payload ? JSON.stringify(payload) : undefined,
        });

        if (!response) {
            return { data: {} };
        }

        let data;
        try {
            data = await response.json();
        } catch {
            data = {};
        }

        return { data };
    },
});
