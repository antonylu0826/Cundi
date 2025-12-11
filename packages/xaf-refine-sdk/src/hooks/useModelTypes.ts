
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "../utils/httpClient";

export interface IModelType {
    Name: string;
    Caption: string;
    IsCreatable: boolean;
    IsDeprecated: boolean;
    Value?: string; // Sometimes used in dropdowns
    Label?: string; // Sometimes used in dropdowns
}

export const useModelTypes = () => {
    return useQuery<IModelType[]>({
        queryKey: ["modelTypes"],
        queryFn: async () => {
            const response = await httpClient("/Model/BusinessObjects");
            if (!response) return [];
            const data = await response.json();

            // Normalize data to ensure it has Label/Value if needed or just return as is
            return data.map((item: any) => ({
                ...item,
                Label: item.Caption,
                Value: item.Name
            }));
        },
        staleTime: Infinity,
    });
};
