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