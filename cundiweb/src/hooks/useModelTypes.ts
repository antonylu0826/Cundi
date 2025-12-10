import { useQuery } from "@tanstack/react-query";
import { dataProvider } from "../odataProvider";

const API_URL = import.meta.env.VITE_API_URL;

export const useModelTypes = () => {
    return useQuery({
        queryKey: ["modelTypes"],
        queryFn: async () => {
            const token = localStorage.getItem("refine-auth");
            const response = await fetch(`${API_URL}/Model/BusinessObjects`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch model types");
            }

            return response.json() as Promise<{ Label: string; Value: string }[]>;
        },
        staleTime: 60 * 60 * 1000, // 1 hour - Business Types rarely change
    });
};
