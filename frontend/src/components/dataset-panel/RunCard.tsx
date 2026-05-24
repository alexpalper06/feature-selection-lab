import React, {useState} from 'react';
import {ChevronDown, Trash2, Pencil, Check, X} from 'lucide-react';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import {fsRunApi} from '../../client/FsRunClient';
import type {FSRunRead, FSRunReadDetails} from "../../client/types/FsRunTypes.ts";

interface RunCardProps {
    run: FSRunRead;
    datasetId: number;
    onDelete?: (runId: number) => void;
    onRename?: (updatedRun: FSRunRead) => void;
}

const STATUS_COLORS = {
    pending: 'gray',
    running: 'blue',
    completed: 'green',
    failed: 'red'
} as const;

const STATUS_LABELS = {
    pending: 'Pending',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed'
} as const;

export default function RunCard({run, datasetId, onDelete, onRename}: RunCardProps): React.ReactElement {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [details, setDetails] = useState<FSRunReadDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editName, setEditName] = useState<string>(run.name);
    const [renaming, setRenaming] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const startEdit = (): void => {
        setEditName(run.name);
        setIsEditing(true);
    };

    const cancelEdit = (): void => {
        setEditName(run.name);
        setIsEditing(false);
    };

    const commitRename = async (): Promise<void> => {
        const trimmed = editName.trim();
        if (!trimmed || trimmed === run.name) {
            cancelEdit();
            return;
        }
        setRenaming(true);
        try {
            const updated = await fsRunApi.rename(datasetId, run.id, trimmed);
            onRename?.(updated);
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to rename:', err);
        } finally {
            setRenaming(false);
        }
    };

    const handleDelete = async (): Promise<void> => {
        if (!window.confirm('Are you sure you want to completely remove this Feature Selection execution?')) {
            return;
        }
        setDeleting(true);
        try {
            await fsRunApi.delete(datasetId, run.id);
            onDelete?.(run.id);
        } catch (err) {
            console.error('Failed to clear execution:', err);
        } finally {
            setDeleting(false);
        }
    };

    const toggleExpand = async (): Promise<void> => {
        const nextState = !expanded;
        setExpanded(nextState);

        // Load JSON details only when successfully completed and not yet fetched
        if (nextState && !details && run.status === 'completed') {
            setLoadingDetails(true);
            try {
                const data = await fsRunApi.get(datasetId, run.id);
                setDetails(data);
            } catch (err) {
                console.error('Failed to extract details:', err);
            } finally {
                setLoadingDetails(false);
            }
        }
    };

    return (
        <div
            className="border border-border-main rounded-xl p-5 bg-surface hover:shadow-md shadow-sm transition-all duration-200">
            {/* Top Header Layout: Identity, Status, and Controls */}
            <div className="flex flex-col gap-3">
                {/* Title Row with Inline Controls */}
                <div className="flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-8 px-2 text-sm font-semibold rounded bg-code-bg border border-border-main
                                               text-text-h focus:outline-none focus:ring-2 focus:ring-accent w-full max-w-xs font-sans"
                                    autoFocus
                                    aria-label="Edit execution name"
                                />
                                <button
                                    onClick={commitRename}
                                    disabled={renaming}
                                    className="p-1.5 text-accent hover:bg-accent-bg rounded-lg transition-colors cursor-pointer
                                               disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent"
                                    aria-label="Confirm rename"
                                    title="Confirm rename"
                                >
                                    <Check className="w-4 h-4"/>
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="p-1.5 text-text-main/80 hover:text-text-h hover:bg-border-main/50 rounded-lg
                                               transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                                    aria-label="Cancel rename"
                                    title="Cancel rename"
                                >
                                    <X className="w-4 h-4"/>
                                </button>
                            </div>
                        ) : (
                            <>
                                <h4 className="text-sm font-bold text-text-h truncate" title={run.name}>{run.name}</h4>
                                <Badge color={STATUS_COLORS[run.status]}>{STATUS_LABELS[run.status]}</Badge>
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {!isEditing && (
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={startEdit}
                                className="p-1.5 text-text-main/60 hover:text-accent hover:bg-accent-bg rounded-md
                                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                aria-label="Rename execution"
                                title="Rename execution"
                            >
                                <Pencil className="w-4 h-4"/>
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="p-1.5 text-text-main/70 hover:text-red-500 hover:bg-red-500/15 rounded-lg
                                           transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                                           focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label="Delete execution"
                                title="Delete execution"
                            >
                                {deleting ? <Spinner className="w-4 h-4"/> : <Trash2 className="w-4 h-4"/>}
                            </button>

                            {run.status === 'completed' && (
                                <button
                                    onClick={toggleExpand}
                                    aria-expanded={expanded}
                                    className={`p-1.5 text-text-main/70 hover:text-text-h hover:bg-code-bg rounded-lg
                                                transition-all cursor-pointer duration-200 focus:outline-none focus:ring-2
                                                focus:ring-accent ${
                                        expanded ? 'rotate-180 text-accent bg-accent-bg/30' : ''
                                    }`}
                                    aria-label={expanded ? 'Collapse details' : 'Expand details'}
                                    title={expanded ? 'Collapse details' : 'Expand details'}
                                >
                                    <ChevronDown className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {/* Execution Timestamp */}
                <p className="text-xs text-text-main/70">
                    Executed on {new Date(run.executed_at).toLocaleString()}
                </p>
            </div>

            {/* Preview parameters (Always Visible) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {/* Method Info */}
                <div
                    className="bg-bg-main border border-border-main/60 rounded-lg p-2.5 flex flex-col justify-between min-w-0">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-text-main/60 mb-1">Feature Selection Method</p>
                    <div className="text-xs font-bold text-text-h">
                        <span className="truncate" title={run.method_name}>{run.method_name}</span>
                    </div>
                </div>

                {/* Target Attribute Indicator */}
                <div
                    className="bg-bg-main border border-border-main/60 rounded-lg p-2.5 flex flex-col justify-between min-w-0">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-text-main/60 mb-1">Target Attribute</p>
                    <div className="text-xs font-bold text-text-h">
                        <span className="text-xs font-mono font-semibold text-text-main/90 truncate"
                              title={run.target_var}>{run.target_var}
                        </span>
                    </div>
                </div>

                {/* Accuracy Preview */}
                <div className="bg-bg-main border border-border-main/60 rounded-lg p-2.5 flex flex-col justify-between">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-text-main/60 mb-1">Accuracy</p>
                    <div className="text-xs font-bold text-text-h">
                        {run.accuracy !== null && run.accuracy !== undefined ? (
                            <span className="text-accent font-mono">
                                {run.accuracy <= 1 ? `${(run.accuracy * 100).toFixed(2)}%` : `${run.accuracy.toFixed(2)}%`}
                            </span>
                        ) : (
                            <span className="text-text-main/60 italic font-normal text-xs">N/A</span>
                        )}
                    </div>
                </div>

                {/* Runtime Performance Timer */}
                <div className="bg-bg-main border border-border-main/60 rounded-lg p-2.5 flex flex-col justify-between">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-text-main/60 mb-1">Execution Time</p>
                    <div className="text-xs font-semibold text-text-h font-mono">
                        {run.execution_time !== null && run.execution_time !== undefined ? (
                            <span className="text-text-h font-bold">{run.execution_time.toFixed(3)}s</span>
                        ) : run.status === 'running' ? (
                            <span className="text-text-main/80 animate-pulse font-normal text-xs">Processing...</span>
                        ) : (
                            <span className="text-text-main/60 italic font-normal text-xs">Pending</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Attributes Execution result and Configuration fields (Hidden Until Expanded) */}
            {expanded && run.status === 'completed' && (
                <div className="mt-4 pt-1 border-t border-border-main/40 animate-fadeIn">
                    {loadingDetails ? (
                        <div className="py-6 flex justify-center"><Spinner aria-label="Loading details"/></div>
                    ) : details ? (
                        <div className="space-y-4 pt-3">

                            {/* Configured parameter values */}
                            {details.parameters && Object.keys(details.parameters).length > 0 && (
                                <div>
                                    <p className="text-[11px] font-semibold text-text-main/70 uppercase tracking-wider mb-2">Parameters</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {Object.entries(details.parameters).map(([key, val]) => (
                                            <div key={key}
                                                 className="bg-code-bg px-2 py-1 rounded border border-border-main/50 text-[11px] font-mono">
                                                <span className="text-text-main/70">{key}:</span>{' '}
                                                <span className="text-text-h font-bold">{String(val)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Selected Features */}
                            {details.selected_features && details.selected_features.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-semibold text-text-main/70 uppercase tracking-wider mb-2">
                                        Selected Attributes
                                        ({details.num_selected_features ?? details.selected_features.length})
                                    </p>
                                    <div
                                        className="flex flex-wrap gap-1 max-h-36 overflow-y-auto border border-border-main/50 rounded-lg p-2 bg-bg-main custom-scrollbar focus:outline-none focus:ring-1 focus:ring-accent"
                                        tabIndex={0}>
                                        {details.selected_features.map((feat) => (
                                            <span key={feat}
                                                  className="px-1.5 py-0.5 bg-accent-bg/50 text-accent border border-accent/20 text-[11px] rounded font-mono font-medium">
                                                {feat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Runtime Exceptions Error */}
            {run.status === 'failed' && run.error_message && (
                <div
                    className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-600 dark:text-red-400 font-medium font-mono">
                    <span className="font-bold font-sans block mb-1">Runtime Error:</span>
                    {run.error_message}
                </div>
            )}
        </div>
    );
}