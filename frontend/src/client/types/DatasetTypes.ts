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

export interface DatasetCreate {
    name: string;
    description?: string;
    targetVariables: string[];
    file: File;
}

// DTOs for feature selection runs
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
    method_category: MethodCategory | string; // Allowing string for flexibility from form selects
    target_var: string;
    parameters: Record<string, any>;
}

export interface FSRunUpdate {
    name: string;
}


export interface ParameterSpec {
    name: string
    type: string
    default: any
    label: string
}

export interface FeatureSelectionMethods {
    name: string;
    category: MethodCategory;
    description: string;
    parameters: ParameterSpec[];
}

/**
 * Lightweight DTO for list views (matches FsRunReadPreview)
 */
export interface FSRunRead {
    id: number;
    dataset_id: number;
    name: string;
    method_name: string;
    method_category: MethodCategory;
    target_var: string;
    status: RunStatus;
    executed_at: string;
    execution_time?: number | null;
    error_message?: string | null;
    accuracy?: number | null;
}

/**
 * Heavyweight DTO for detail views, appending the heavy JSON objects (matches FSRunReadDetails)
 */
export interface FSRunReadDetails {
    parameters: Record<string, any>;
    num_selected_features?: number | null;
    selected_features?: string[] | null;

}
