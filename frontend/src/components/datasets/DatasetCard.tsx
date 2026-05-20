// src/components/datasets/DatasetCard.tsx
import React, { useState } from 'react';
import { Database, Trash2, Pencil, Check, X, Target, Calendar } from 'lucide-react';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import { datasetApi } from '../../client/DatasetClient';
import type { DatasetRead } from '../../client/types';

interface DatasetCardProps {
  dataset: DatasetRead;
  onDelete?: (id: number) => void;
  onRename?: (dataset: DatasetRead) => void;
}

export default function DatasetCard({ dataset, onDelete, onRename }: DatasetCardProps): React.ReactElement {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(dataset.name);
  const [renaming, setRenaming] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const startEdit = (): void => { setEditName(dataset.name); setIsEditing(true); };
  const cancelEdit = (): void => { setEditName(dataset.name); setIsEditing(false); };

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

  return (
    <div className="bg-bg-main border border-border-main rounded-xl p-5 space-y-4 hover:border-accent-border/60 transition-all duration-200 relative group shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-code-bg border border-border-main flex items-center justify-center text-text-main/60 flex-shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={renaming}
                  className="w-full text-sm font-semibold text-text-h bg-code-bg border border-accent rounded px-2 py-0.5 focus:outline-none"
                  autoFocus
                />
                <button onClick={commitRename} disabled={renaming} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded">
                  {renaming ? <Spinner /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button onClick={cancelEdit} disabled={renaming} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <h3 className="text-sm font-semibold text-text-h truncate group-hover:text-accent transition-colors">
                {dataset.name}
              </h3>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={startEdit} disabled={deleting} className="p-1.5 text-text-main/40 hover:text-accent hover:bg-accent-bg rounded-md transition-colors" title="Rename asset">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={commitDelete} disabled={deleting} className="p-1.5 text-text-main/40 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Delete asset">
              {deleting ? <Spinner /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {dataset.description && (
        <p className="text-xs text-text-main/50 -mt-1 line-clamp-2 leading-relaxed">
          {dataset.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-code-bg rounded-lg px-3 py-2">
          <p className="text-xs text-text-main/50 mb-0.5">Rows</p>
          <p className="text-sm font-bold text-text-h">{dataset.num_rows.toLocaleString()}</p>
        </div>
        <div className="bg-code-bg rounded-lg px-3 py-2">
          <p className="text-xs text-text-main/50 mb-0.5">Columns</p>
          <p className="text-sm font-bold text-text-h">{dataset.num_cols}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-text-main/50 flex items-center gap-1 mb-2">
          <Target className="w-3 h-3" /> Targets
        </p>
        {dataset.target_variables.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {dataset.target_variables.map((t) => (
              <Badge key={t} color="blue">{t}</Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-text-main/30 italic">None selected</span>
        )}
      </div>

      <div className="pt-3 border-t border-border-main/60 flex items-center justify-between text-[11px] text-text-main/40">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(dataset.uploaded_at).toLocaleDateString()}
        </span>
        <span>ID: #{dataset.id}</span>
      </div>
    </div>
  );
}