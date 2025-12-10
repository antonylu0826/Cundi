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

        // Fetch user details including Photo and Roles with IsAdministrative flag
        try {
          const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/odata/ApplicationUser?$filter=UserName eq '${username}'&$top=1&$expand=Roles($select=Name,IsAdministrative)`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (userResponse.ok) {
            const data = await userResponse.json();
            if (data.value && data.value.length > 0) {
              const user = data.value[0];
              if (user.Photo) {
                localStorage.setItem("user_photo", user.Photo);
              } else {
                localStorage.removeItem("user_photo");
              }
              localStorage.setItem("user_name", user.DisplayName || user.UserName);
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
    const name = localStorage.getItem("user_name") || "Admin";
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
};
