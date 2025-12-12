
export const TOKEN_KEY = "refine-auth";

export class HttpError extends Error {
    statusCode: number;
    message: string;
    body: any;

    constructor(statusCode: number, message: string, body: any) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.body = body;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}

export interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

// In SDK, VITE_API_URL might not exist. We should probably allow configuring Base URL.
// For now, let's keep it simple and assume the consuming app sets the global env or we export a helper to set it.
// Better yet, make httpClient a class or factory.
// For simplicity in this demo, we will check `import.meta.env.VITE_API_URL` but fallback to empty string or throw if missing.

export const getBaseUrl = () => {
    // @ts-ignore
    return import.meta.env?.VITE_API_URL || "";
};

export const httpClient = async (endpoint: string, options: RequestOptions = {}) => {
    const { skipAuth, headers, ...restOptions } = options;

    const baseUrl = getBaseUrl();
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (!skipAuth) {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            defaultHeaders["Authorization"] = `Bearer ${token}`;
        }
    }

    const config = {
        ...restOptions,
        headers: {
            ...defaultHeaders,
            ...headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorBody = await response.text();
            let parsedError;
            try {
                parsedError = JSON.parse(errorBody);
            } catch {
                parsedError = errorBody;
            }

            throw new HttpError(response.status, response.statusText, parsedError);
        }

        if (response.status === 204) {
            return null;
        }

        return response;
    } catch (error) {
        if (error instanceof HttpError) {
            throw error;
        }
        throw new HttpError(500, "Network Error", error);
    }
};

export const parseJwt = (token: string) => {
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
};
