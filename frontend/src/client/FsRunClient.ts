// src/client/DatasetApi.ts
import axiosClient from './AxiosClient';
import type {
    FSRunCreate,
    FSRunRead,
    ComparisonData,
    MethodCategory
} from './types.ts';

export const fsRunApi = {
  create: async (datasetId: number, params: FSRunCreate): Promise<FSRunRead> => {
    const { data } = await axiosClient.post<FSRunRead>(`/datasets/${datasetId}/runs`, params);
    return data;
  },

  list: async (datasetId: number): Promise<FSRunRead[]> => {
    const { data } = await axiosClient.get<FSRunRead[]>(`/datasets/${datasetId}/runs`);
    return data;
  },

  get: async (datasetId: number, runId: number): Promise<FSRunRead> => {
    const { data } = await axiosClient.get<FSRunRead>(`/datasets/${datasetId}/runs/${runId}`);
    return data;
  },

  rename: async (datasetId: number, runId: number, name: string): Promise<FSRunRead> => {
    const { data } = await axiosClient.patch<FSRunRead>(`/datasets/${datasetId}/runs/${runId}`, { name });
    return data;
  },

  delete: async (datasetId: number, runId: number): Promise<void> => {
    await axiosClient.delete(`/datasets/${datasetId}/runs/${runId}`);
  },

  compare: async (datasetId: number, runIds: number[]): Promise<ComparisonData> => {
    const { data } = await axiosClient.post<ComparisonData>(`/datasets/${datasetId}/comparisons`, { run_ids: runIds });
    return data;
  }
};