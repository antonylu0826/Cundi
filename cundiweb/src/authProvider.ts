import { AuthProvider } from "@refinedev/core";
import { authService } from "./services/authService";
import { TOKEN_KEY, parseJwt } from "./utils/httpClient";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const token = await authService.login({ username, password });

      if (token) {
        localStorage.setItem(TOKEN_KEY, token);

        // Parse JWT to get claims
        const claims = parseJwt(token);
        // Standardize claims extraction
        const userId = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || claims.sub || claims.id || claims.Oid;
        const claimName = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || claims.unique_name || claims.name || username;

        // Fetch user details
        try {
          let user = null;
          if (userId) {
            user = await authService.getUserById(userId);
          } else {
            user = await authService.getUserByUsername(username);
          }

          if (user) {
            if (user.Photo) {
              localStorage.setItem("user_photo", user.Photo);
            } else {
              localStorage.removeItem("user_photo");
            }

            localStorage.setItem("user_name", user.DisplayName || user.UserName || claimName);
            localStorage.setItem("user_id", (user as any).Oid || userId); // Cast as any because Oid is in IApplicationUser but double check

            // Check if user is Admin
            let isAdmin = false;
            if ((user as any).Roles) { // Roles not in interface yet or need to be added
              const roles = (user as any).Roles.map((r: any) => r.Name);
              localStorage.setItem("user_roles", JSON.stringify(roles));
              isAdmin = (user as any).Roles.some((r: any) => r.IsAdministrative);
            }
            localStorage.setItem("user_is_admin", isAdmin ? "true" : "false");
          }
        } catch (error) {
          console.error("Failed to fetch user details", error);
          // Don't fail login if profile fetch fails, but might be good to warn
        }

        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: {
          message: "Login failed",
          name: "Invalid credentials",
        },
      };
    } catch (e) {
      return {
        success: false,
        error: {
          message: "Login failed",
          name: "Network or Server Error",
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user_photo");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_roles");
    localStorage.removeItem("user_is_admin");
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const claims = parseJwt(token);
        const exp = claims.exp;
        if (exp && Date.now() >= exp * 1000) {
          console.warn("Token expired");
          return {
            authenticated: false,
            redirectTo: "/login",
            logout: true,
          };
        }
      } catch (e) {
        console.error("Invalid token format", e);
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: true,
        };
      }

      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => {
    const roles = localStorage.getItem("user_roles");
    return roles ? JSON.parse(roles) : [];
  },
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const photo = localStorage.getItem("user_photo");
    const name = localStorage.getItem("user_name") || "";
    const id = localStorage.getItem("user_id");

    if (token) {
      return {
        id: id || "1",
        name: name,
        avatar: photo ? `data:image/png;base64,${photo}` : "https://i.pravatar.cc/150",
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    if (error?.statusCode === 401 || error?.status === 401) {
      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }
    return { error };
  },
  updatePassword: async ({ password }) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      return {
        success: false,
        error: {
          message: "User ID not found",
          name: "Error",
        }
      };
    }

    try {
      await authService.resetPassword(userId, password);
      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: "Failed to change password",
          name: "Update Password Error",
        }
      };
    }
  },
};
