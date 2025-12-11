import { useQuery } from "@tanstack/react-query";
import { httpClient } from "../utils/httpClient";

const API_URL = import.meta.env.VITE_API_URL;

export const useModelTypes = () => {
    return useQuery({
        queryKey: ["modelTypes"],
        queryFn: async () => {
            const response = await httpClient("/Model/BusinessObjects");

            if (!response) {
                throw new Error("Failed to fetch model types");
            }

            return response.json() as Promise<{ Label: string; Value: string }[]>;
        },
        staleTime: 60 * 60 * 1000, // 1 hour - Business Types rarely change
    });
};
