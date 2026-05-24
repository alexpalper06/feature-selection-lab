// DTOs for Dataset related fields
export interface DatasetCreate {
    name: string;
    description?: string;
    targetVariables: string[];
    file: File;
}

export interface FileAnalysisResponse {
    name: string;
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
    dataset_name: string;
}

export interface ClassDistributionDetails {
    counts: Record<string, number>;
    percentages: Record<string, number>;
}

export interface DatasetDetails extends DatasetRead {
    columns: string[];
    rows: Record<string, any>[];
    class_distribution: Record<string, ClassDistributionDetails>
}




