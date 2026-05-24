// src/client/DatasetApi.ts
import axiosClient from './AxiosClient';
import type {
    FileAnalysisResponse,
    DatasetRead,
    DatasetDetails,
    DatasetCreate,
} from './types/DatasetTypes.ts';

export const datasetApi = {
    analyze: async (file: File): Promise<FileAnalysisResponse> => {
        const fd = new FormData();
        fd.append('file', file);

        const {data} = await axiosClient.post<FileAnalysisResponse>('/datasets/analyze', fd, {
            headers: {'Content-Type': 'multipart/form-data'}
        });
        return data;
    },

    create: async (params: DatasetCreate): Promise<DatasetRead> => {
        // Create a FormData() to send the different parameters and the file
        // since how http works, we cannot send a serialized JSON
        const fd = new FormData();

        fd.append('name', params.name);

        if (params.description) fd.append('description', params.description);

        params.targetVariables.forEach(t => fd.append('target_variables', t));
        fd.append('file', params.file);


        const {data} = await axiosClient.post<DatasetRead>('/datasets/', fd, {
            headers: {'Content-Type': 'multipart/form-data'}
        });
        return data;
    },

    list: async (): Promise<DatasetRead[]> => {
        const {data} = await axiosClient.get<DatasetRead[]>('/datasets/');
        return data;
    },

    get: async (id: number): Promise<DatasetDetails> => {
        const {data} = await axiosClient.get<DatasetDetails>(`/datasets/${id}`);
        return data;
    },

    rename: async (id: number, name: string): Promise<DatasetRead> => {
        const {data} = await axiosClient.patch<DatasetRead>(`/datasets/${id}`, {name});
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosClient.delete(`/datasets/${id}`);
    }
};