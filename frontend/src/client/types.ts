export interface FileAnalysisResponse {
  columns: string[];
  rows: Record<string, any>[];
  num_rows: number;
  num_cols: number;
}

export interface DatasetRead {
  id: number;
  name: string;
  description?: string | null;
  num_cols: number;
  num_rows: number;
  target_variables: string[];
  uploaded_at: string;
}

export interface DatasetPreview extends DatasetRead {
  columns: string[];
  rows: Record<string, any>[];
}

export interface DatasetCreate {
  name: string;
  description?: string;
  targetVariables: string[];
  file: File;
}

// https://typescript.tv/best-practices/why-typescript-enums-are-dead/#the-modern-alternative

export const RunStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export type RunStatus = typeof RunStatus[keyof typeof RunStatus];

export const MethodCategory = {
  FILTER: 'filter',
  WRAPPER: 'wrapper'
} as const;

export type MethodCategory = typeof MethodCategory[keyof typeof MethodCategory];

export interface FSRunCreate {
  name: string;
  method_name: string;
  method_category: MethodCategory;
  target_var: string;
  parameters: Record<string, any>;
}

export interface FSRunRead {
  id: number;
  dataset_id: number;
  name: string;
  method_name: string;
  method_category: MethodCategory;
  target_var?: string | null;
  status: RunStatus;
  executed_at: string;
  execution_time?: number | null;
  accuracy?: number | null;
  num_selected_features?: number | null;
  selected_features?: string[] | null;
  feature_scores?: Record<string, number> | null;
  feature_rankings?: Record<string, number> | null;
  error_message?: string | null;
  parameters: Record<string, any>;
}

export interface ComparisonData {
  runs: FSRunRead[];
  targetVar: string;
}
