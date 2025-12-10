import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action }) => {
        const isAdmin = localStorage.getItem("user_is_admin") === "true";

        // Restrict access to "ApplicationUser", "PermissionPolicyRole" and "Settings" resources to Administrators only
        if ((resource === "ApplicationUser" || resource === "PermissionPolicyRole" || resource === "Settings") && !isAdmin) {
            return {
                can: false,
                reason: "Only Administrators can access Settings",
            };
        }

        return { can: true };
    },
    options: {
        buttons: {
            enableAccessControl: true,
            hideIfUnauthorized: true,
        },
    },
};
