import { httpClient } from "../utils/httpClient";
import { IApplicationUser } from "../interfaces";

export const authService = {
    login: async ({ username, password }: any) => {
        const response = await httpClient("/Authentication/Authenticate", {
            method: "POST",
            body: JSON.stringify({ userName: username, password }),
            skipAuth: true,
        });

        if (!response) {
            throw new Error("No response from login endpoint");
        }

        const token = await response.text();
        return token;
    },

    getUserByUsername: async (username: string): Promise<IApplicationUser | null> => {
        const queryUrl = `/odata/ApplicationUser?$filter=tolower(UserName) eq '${username.toLowerCase()}'&$top=1&$expand=Roles($select=Name,IsAdministrative)`;
        const response = await httpClient(queryUrl);
        if (!response) return null;

        const data = await response.json();
        return (data.value && data.value.length > 0) ? data.value[0] : null;
    },

    getUserById: async (userId: string): Promise<IApplicationUser | null> => {
        const queryUrl = `/odata/ApplicationUser(${userId})?$expand=Roles($select=Name,IsAdministrative)`;
        const response = await httpClient(queryUrl);
        if (!response) return null;

        const data = await response.json();
        return data;
    },

    resetPassword: async (userId: string, newPassword: string) => {
        await httpClient("/User/ResetPassword", {
            method: "POST",
            body: JSON.stringify({
                userId: userId,
                newPassword: newPassword
            })
        });
        return true;
    }
};
