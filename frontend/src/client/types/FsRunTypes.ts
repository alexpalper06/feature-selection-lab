// DTOs for Feature Selection runs
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
 *  DTO for list views. Includes the information used for previewing
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
 * DTO for detail views. Includes the details that are appended into an FS Run when it is required to show more information
 */
export interface FSRunReadDetails {
    parameters: Record<string, any>;
    num_selected_features?: number | null;
    selected_features?: string[] | null;

}