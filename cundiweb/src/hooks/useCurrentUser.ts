import { useGetIdentity } from "@refinedev/core";
import { IApplicationUser } from "@cundi/refine-xaf";

export interface ICurrentUser extends IApplicationUser {
    id: string; // Refine expects 'id'
    roles: string[];
    isAdmin: boolean;
}

export const useCurrentUser = () => {
    const { data, isLoading, error } = useGetIdentity<ICurrentUser>();

    // In authProvider.getIdentity, we construct the identity object.
    // We should align the interface.
    // currently getIdentity returns { id, name, avatar }. 
    // We might want to expand getIdentity to return more info if needed,
    // or use a separate query to get full profile if getIdentity is lightweight.

    // Based on authProvider implementation:
    // getIdentity returns { id, name, avatar }
    // It reads from localStorage.

    // If we want full user object, we might need a dedicated hook that calls authService.getUserById
    // leveraging react-query.

    return {
        user: data,
        isLoading,
        error
    };
};
