import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Trash2, Pencil, Check, X, Target, Calendar} from 'lucide-react';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import {datasetApi} from '../../client/DatasetClient';
import type {DatasetRead} from '../../client/types/DatasetTypes.ts';

interface DatasetCardProps {
    dataset: DatasetRead;
    onDelete?: (id: number) => void;
    onRename?: (dataset: DatasetRead) => void;
}

export default function DatasetCard({dataset, onDelete, onRename}: DatasetCardProps): React.ReactElement {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editName, setEditName] = useState<string>(dataset.name);
    const [renaming, setRenaming] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);

    const startEdit = (): void => {
        setEditName(dataset.name);
        setIsEditing(true);
    };
    const cancelEdit = (): void => {
        setEditName(dataset.name);
        setIsEditing(false);
    };

    const commitRename = async (): Promise<void> => {
        const trimmed = editName.trim();
        if (!trimmed || trimmed === dataset.name) {
            cancelEdit();
            return;
        }
        setRenaming(true);
        try {
            const updated = await datasetApi.rename(dataset.id, trimmed);
            onRename?.(updated);
            setIsEditing(false);
        } catch {
            cancelEdit();
        } finally {
            setRenaming(false);
        }
    };

    const commitDelete = async (): Promise<void> => {
        if (!window.confirm(`Permanently remove ${dataset.name}?`)) return;
        setDeleting(true);
        try {
            await datasetApi.delete(dataset.id);
            onDelete?.(dataset.id);
        } catch {
            setDeleting(false);
        }
    };

    const handleCardClick = (): void => {
        if (!isEditing && !deleting) {
            navigate(`/datasets/${dataset.id}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            onKeyDown={(e) => {
                if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
            role="button"
            tabIndex={isEditing ? -1 : 0}
            aria-label={`View dataset ${dataset.name}`}
            className="bg-surface border border-border-main rounded-xl p-5 space-y-4 hover:border-accent-border
                       hover:shadow-md transition-all duration-200 relative group shadow-sm cursor-pointer
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
            {/* Top Header Row */}
            <div className="relative flex items-start justify-end min-h-[36px]">

                {/* Center */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-12 z-0">
                    <div className="w-full">
                        {isEditing ? (
                            <div className="flex items-center justify-center gap-1 mt-0.5 pointer-events-auto">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.stopPropagation();
                                            commitRename();
                                        }
                                        if (e.key === 'Escape') {
                                            e.stopPropagation();
                                            cancelEdit();
                                        }
                                    }}
                                    disabled={renaming}
                                    className="w-full max-w-[150px] text-center text-sm font-semibold text-text-h bg-code-bg
                                               border border-accent rounded px-2 py-0.5 focus:outline-none focus:ring-2
                                               focus:ring-accent/50 disabled:opacity-50"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="Rename dataset"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        commitRename();
                                    }}
                                    disabled={renaming}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded
                                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                               focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                    aria-label="Confirm rename"
                                >
                                    {renaming ? <Spinner className="w-3.5 h-3.5"/> : <Check className="w-3.5 h-3.5"/>}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        cancelEdit();
                                    }}
                                    disabled={renaming}
                                    className="p-1.5 text-text-main/70 hover:text-red-500 hover:bg-red-500/10 rounded
                                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                               focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                    aria-label="Cancel rename"
                                >
                                    <X className="w-3.5 h-3.5"/>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-0.5 text-center pointer-events-auto">
                                <h3 className="text-sm font-semibold text-text-h truncate group-hover:text-accent transition-colors">
                                    {dataset.name}
                                </h3>
                                <p
                                    className="text-[11px] text-text-main/60 font-mono truncate mx-auto max-w-full"
                                    title={`Source file: ${dataset.dataset_name}`}
                                >
                                    {dataset.dataset_name}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                {!isEditing && (
                    <div
                        className="flex items-center gap-0.5 opacity-100 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10 relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                startEdit();
                            }}
                            disabled={deleting}
                            className="p-1.5 text-text-main/60 hover:text-accent hover:bg-accent-bg rounded-md
                                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            title="Rename dataset"
                            aria-label="Rename dataset"
                        >
                            <Pencil className="w-3.5 h-3.5"/>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                commitDelete();
                            }}
                            disabled={deleting}
                            className="p-1.5 text-text-main/60 hover:text-red-500 hover:bg-red-500/10 rounded-md
                                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none
                                       focus-visible:ring-2 focus-visible:ring-accent"
                            title="Delete dataset"
                            aria-label="Delete dataset"
                        >
                            {deleting ? <Spinner className="w-3.5 h-3.5"/> : <Trash2 className="w-3.5 h-3.5"/>}
                        </button>
                    </div>
                )}
            </div>

            {dataset.description && (
                <p className="text-xs text-text-main/70 -mt-1 line-clamp-2 leading-relaxed">
                    {dataset.description}
                </p>
            )}

            <div className="grid grid-cols-2 gap-2">
                <div className="bg-code-bg rounded-lg px-3 py-2 border border-border-main/50">
                    <p className="text-[11px] uppercase font-semibold text-text-main/60 mb-0.5">Rows</p>
                    <p className="text-sm font-bold text-text-h">{dataset.num_rows.toLocaleString()}</p>
                </div>
                <div className="bg-code-bg rounded-lg px-3 py-2 border border-border-main/50">
                    <p className="text-[11px] uppercase font-semibold text-text-main/60 mb-0.5">Columns</p>
                    <p className="text-sm font-bold text-text-h">{dataset.num_cols}</p>
                </div>
            </div>

            <div>
                <p className="text-xs text-text-main/70 font-semibold flex items-center gap-1.5 mb-2">
                    <Target className="w-3.5 h-3.5"/> Targets
                </p>
                {dataset.target_variables.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {dataset.target_variables.map((t) => (
                            <Badge key={t} color="blue">{t}</Badge>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs text-text-main/50 italic">None selected</span>
                )}
            </div>

            <div className="pt-3 border-t border-border-main/60 flex items-center justify-between text-[12px] font-medium text-text-main/60">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5"/>
                    {new Date(dataset.uploaded_at).toLocaleDateString()}
                </span>
                <span className="font-mono bg-code-bg px-1.5 py-0.5 rounded border border-border-main/50">
                    ID: #{dataset.id}
                </span>
            </div>
        </div>
    );
}