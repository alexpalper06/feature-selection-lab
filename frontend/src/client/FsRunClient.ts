// src/client/FsRunClient.ts
import axiosClient from './AxiosClient';
import type {FeatureSelectionMethods, FSRunCreate, FSRunRead, FSRunReadDetails} from "./types/FsRunTypes.ts";

export const fsRunApi = {

    getMethods: async (): Promise<FeatureSelectionMethods[]> => {
        const {data} = await axiosClient.get<FeatureSelectionMethods[]>('/datasets/methods');
        return data;
    },

    create: async (datasetId: number, params: FSRunCreate): Promise<FSRunRead> => {
        const {data} = await axiosClient.post<FSRunRead>(`/datasets/${datasetId}/runs`, params);
        return data;
    },


    list: async (datasetId: number, targetVar?: string): Promise<FSRunRead[]> => {
        const {data} = await axiosClient.get<FSRunRead[]>(`/datasets/${datasetId}/runs`, {
            params: targetVar ? {target_var: targetVar} : undefined
        });
        return data;
    },

    get: async (datasetId: number, runId: number): Promise<FSRunReadDetails> => {
        const {data} = await axiosClient.get<FSRunReadDetails>(`/datasets/${datasetId}/runs/${runId}`);
        return data;
    },

    rename: async (datasetId: number, runId: number, name: string): Promise<FSRunRead> => {
        const {data} = await axiosClient.patch<FSRunRead>(`/datasets/${datasetId}/runs/${runId}`, {name});
        return data;
    },

    delete: async (datasetId: number, runId: number): Promise<void> => {
        await axiosClient.delete(`/datasets/${datasetId}/runs/${runId}`);
    },
};