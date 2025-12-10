import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action }) => {
        const roles = JSON.parse(localStorage.getItem("user_roles") || "[]");

        // Restrict access to "ApplicationUser" and "Settings" resources to Administrators only
        if ((resource === "ApplicationUser" || resource === "Settings") && !roles.includes("Administrators")) {
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
