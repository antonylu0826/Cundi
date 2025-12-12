
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

            // API returns { Label: string, Value: string }
            // We map this to our internal interface
            return data.map((item: any) => ({
                Name: item.Value,
                Caption: item.Label,
                IsCreatable: true, // Defaulting to true as API doesn't return this yet
                IsDeprecated: false, // Defaulting to false as API doesn't return this yet
                Label: item.Label,
                Value: item.Value
            }));
        },
        staleTime: Infinity,
    });
};
