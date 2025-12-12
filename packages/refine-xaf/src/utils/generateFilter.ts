import { CrudFilters, CrudFilter, LogicalFilter } from "@refinedev/core";

export const mapOperator = (operator: string): string => {
    switch (operator) {
        case "eq": return "eq";
        case "ne": return "ne";
        case "lt": return "lt";
        case "gt": return "gt";
        case "lte": return "le";
        case "gte": return "ge";
        case "in": return "in"; // OData v4.01 usually, or handled manually
        case "contains": return "contains";
        case "startswith": return "startswith";
        case "endswith": return "endswith";
    }
    return "eq";
};

export const generateFilter = (filters?: CrudFilters): string => {
    if (!filters || filters.length === 0) {
        return "";
    }

    const queryFilters = filters.map((filter) => {
        if ("field" in filter) {
            // LogicalFilter
            const { field, operator, value } = filter;
            
            if (value === undefined || value === null) {
                return "";
            }

            const mappedOp = mapOperator(operator);

            // Handle standard operators
            if (mappedOp === "eq" || mappedOp === "ne" || mappedOp === "lt" || mappedOp === "gt" || mappedOp === "le" || mappedOp === "ge") {
                 // Check if value is a GUID-like string to avoid quoting issues? 
                 // XAF OData usually handles auto-conversion if quoted, but unquoted GUIDs are safer in some contexts.
                 // However, refine usually passes strings. Let's rely on standard 'value' quoting unless it's a number/boolean.
                 
                 const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value?.toString());
                 const val = (typeof value === "string" && !isGuid) ? `'${value}'` : value;
                 
                 return `${field} ${mappedOp} ${val}`;
            }
            
            if (mappedOp === "contains" || mappedOp === "startswith" || mappedOp === "endswith") {
                return `${mappedOp}(${field}, '${value}')`;
            }

            if (mappedOp === "in" && Array.isArray(value)) {
                 // "Field in ('a', 'b')" is valid OData 4.01. 
                 // Fallback for older contexts: "(Field eq 'a' or Field eq 'b')"
                 // Let's implement the safer 'or' chain for maximum XAF compatibility
                 return `(${value.map(v => {
                    const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v?.toString());
                    const val = (typeof v === "string" && !isGuid) ? `'${v}'` : v;
                    return `${field} eq ${val}`;
                 }).join(" or ")})`;
            }
        }
        
        // ConditionalFilter (nested)
        if ("operator" in filter && "value" in filter && Array.isArray(filter.value)) {
             const { operator, value } = filter as LogicalFilter;
             const nestedFilter = generateFilter(value);
             if (nestedFilter) {
                 return `(${nestedFilter})`; // The recursive call returns joined string, wrap in parens?
                 // Wait, generateFilter returns "A and B".
                 // Logic here: value is an array of filters.
                 // We need to join them with the operator (or/and).
             }
             // Actually my generateFilter interface expects CrudFilters (array), so recursion needs to handle the joining.
             // But map returns array of strings.
        }
        
        // Let's correct recursion logic.
        // The top level generateFilter joins with "and".
        // Nested LogicalFilter (operator: "or", value: [FilterA, FilterB]) needs to join with "or".
        
        return "";
    }).filter(f => f);

    return queryFilters.join(" and ");
};

// We need a specific function for handling the nested array properly because generateFilter joins with "and" by default.
export const generateFilterString = (filters?: CrudFilters): string => {
    if (!filters || filters.length === 0) return "";

    return filters.map(filter => parseFilter(filter)).filter(f => f).join(" and ");
}

const parseFilter = (filter: CrudFilter): string => {
    if ("field" in filter) {
        // LogicalFilter (Simple)
        const { field, operator, value } = filter;
        if (value === undefined || value === null) return "";
        
        const mappedOp = mapOperator(operator);
        
        const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value?.toString());
        const safeValue = (typeof value === "string" && !isGuid) ? `'${value}'` : value;

        if (mappedOp === "contains" || mappedOp === "startswith" || mappedOp === "endswith") {
            return `${mappedOp}(${field}, '${value}')`;
        }
        
        if (operator === "in" && Array.isArray(value)) {
            return `(${value.map(v => {
                const isGuidV = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v?.toString());
                const val = (typeof v === "string" && !isGuidV) ? `'${v}'` : v;
                return `${field} eq ${val}`;
            }).join(" or ")})`;
        }
        
        return `${field} ${mappedOp} ${safeValue}`;
    } 
    else {
        // ConditionalFilter (Complex: OR/AND)
        const { operator, value } = filter;
        // schema: { operator: "or", value: [Filter1, Filter2] }
        if (!Array.isArray(value)) return "";
        
        const nested = value.map(f => parseFilter(f)).filter(f => f);
        return `(${nested.join(` ${operator} `)})`;
    }
}
