import { AuthProvider } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Authentication/Authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName: username, password }),
      });

      if (response.ok) {
        const token = await response.text();
        localStorage.setItem(TOKEN_KEY, token);

        // Parse JWT to get claims
        const claims = parseJwt(token);

        const userId = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || claims.sub || claims.id || claims.Oid;
        const claimName = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || claims.unique_name || claims.name || username;

        // Fetch user details including Photo and Roles with IsAdministrative flag
        try {
          // Fallback to username if ID not found (though ID is preferable)
          let queryUrl = `${import.meta.env.VITE_API_URL}/odata/ApplicationUser?$filter=tolower(UserName) eq '${username.toLowerCase()}'&$top=1&$expand=Roles($select=Name,IsAdministrative)`;

          if (userId) {
            queryUrl = `${import.meta.env.VITE_API_URL}/odata/ApplicationUser(${userId})?$expand=Roles($select=Name,IsAdministrative)`;
          }

          const userResponse = await fetch(queryUrl, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (userResponse.ok) {
            const data = await userResponse.json();

            // Handle both List response (from filter) and Single response (from ID)
            const user = userId ? data : (data.value && data.value.length > 0 ? data.value[0] : null);

            if (user) {
              if (user.Photo) {
                localStorage.setItem("user_photo", user.Photo);
              } else {
                localStorage.removeItem("user_photo");
              }
              // Logic: DisplayName > UserName > ClaimName > Username Input
              localStorage.setItem("user_name", user.DisplayName || user.UserName || claimName);
              localStorage.setItem("user_id", user.Oid);

              // Check if user is Admin
              let isAdmin = false;
              if (user.Roles) {
                const roles = user.Roles.map((r: any) => r.Name);
                localStorage.setItem("user_roles", JSON.stringify(roles));
                isAdmin = user.Roles.some((r: any) => r.IsAdministrative);
              }
              localStorage.setItem("user_is_admin", isAdmin ? "true" : "false");
            }
          }
        } catch (error) {
          console.error("Failed to fetch user details", error);
        }

        return {
          success: true,
          redirectTo: "/",
        };
      } else {
        return {
          success: false,
          error: {
            message: "Login failed",
            name: "Invalid email or password",
          },
        };
      }
    } catch (e) {
      return {
        success: false,
        error: {
          message: "Login failed",
          name: "Network error",
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
      // Check if token is expired
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
        // If token cannot be parsed, treat as invalid
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
    const token = localStorage.getItem(TOKEN_KEY);
    const userId = localStorage.getItem("user_id");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/User/ResetPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          newPassword: password
        })
      });

      if (response.ok) {
        return {
          success: true,
          redirectTo: "/login", // Redirect to login implies we might want to logout, let's check header.tsx behavior.
          // Header.tsx had explicit logout(). Refine's updatePassword usually just returns success.
          // But here we want to enforce logout or at least return success so the hook knows.
          // If we return success: true, the useUpdatePassword hook will resolve successfully.
        };
      } else {
        return {
          success: false,
          error: {
            message: "Failed to change password",
            name: "Update Password Error",
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: "Network error",
          name: "NetworkError",
        }
      };
    }
  },
};

// Helper to parse JWT
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT", e);
    return {};
  }
}
