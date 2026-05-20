import React, { useState } from 'react';
import { ChevronDown, Trash2, Pencil, Check, X } from 'lucide-react';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import { fsRunApi } from '../../client/FsRunClient';
import type { FSRunRead, RunStatus } from '../../client/types';

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

export default function RunCard({ run, datasetId, onDelete, onRename }: RunCardProps): React.ReactElement {
  const [expanded, setExpanded] = useState<boolean>(false);
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
    } catch {
      cancelEdit();
    } finally {
      setRenaming(false);
    }
  };

  const commitDelete = async (): Promise<void> => {
    if (!window.confirm(`Permanently remove run "${run.name}"?`)) return;
    setDeleting(true);
    try {
      await fsRunApi.delete(datasetId, run.id);
      onDelete?.(run.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-bg-main border border-border-main rounded-lg overflow-hidden hover:border-accent-border/60 transition-all duration-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-code-bg/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ChevronDown
            className={[
              'w-4 h-4 text-text-main/60 flex-shrink-0 transition-transform',
              expanded ? 'rotate-180' : ''
            ].join(' ')}
          />

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={renaming}
                  className="text-sm font-medium text-text-h bg-code-bg border border-accent rounded px-2 py-0.5 focus:outline-none flex-1"
                  autoFocus
                />
                <button
                  onClick={(e) => { e.stopPropagation(); commitRename(); }}
                  disabled={renaming}
                  className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                >
                  {renaming ? <Spinner size="sm" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                  disabled={renaming}
                  className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <h4 className="text-sm font-medium text-text-h truncate">{run.name}</h4>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge color="blue">{run.method_name}</Badge>
          <Badge color={STATUS_COLORS[run.status]}>{STATUS_LABELS[run.status]}</Badge>
          {!isEditing && (
            <div className="flex items-center gap-0.5 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); startEdit(); }}
                disabled={deleting}
                className="p-1 text-text-main/40 hover:text-accent hover:bg-accent-bg rounded transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); commitDelete(); }}
                disabled={deleting}
                className="p-1 text-text-main/40 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
              >
                {deleting ? <Spinner size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 py-3 border-t border-border-main/60 space-y-4 bg-code-bg/30">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-text-main/50 mb-1">Target Variable</p>
              <p className="text-sm font-medium text-text-h">{run.target_var || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-main/50 mb-1">Execution Time</p>
              <p className="text-sm font-medium text-text-h">
                {run.execution_time ? `${run.execution_time.toFixed(2)}s` : '—'}
              </p>
            </div>
            {run.accuracy !== null && (
              <div>
                <p className="text-xs text-text-main/50 mb-1">Accuracy</p>
                <p className="text-sm font-medium text-text-h">{(run.accuracy * 100).toFixed(2)}%</p>
              </div>
            )}
            {run.num_selected_features !== null && (
              <div>
                <p className="text-xs text-text-main/50 mb-1">Selected Features</p>
                <p className="text-sm font-medium text-text-h">{run.num_selected_features}</p>
              </div>
            )}
          </div>

          {(run.selected_features || run.feature_scores || run.feature_rankings) && (
            <div className="pt-2 border-t border-border-main/60">
              {run.selected_features && (
                <div>
                  <p className="text-xs text-text-main/50 mb-2 font-medium">Selected Features</p>
                  <div className="flex flex-wrap gap-1">
                    {run.selected_features.map((feat) => (
                      <span key={feat} className="px-2 py-1 bg-accent-bg text-accent text-xs rounded">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {run.feature_scores && (
                <div className="mt-2">
                  <p className="text-xs text-text-main/50 mb-2 font-medium">Feature Scores</p>
                  <div className="space-y-1 text-xs">
                    {Object.entries(run.feature_scores).slice(0, 5).map(([feat, score]) => (
                      <div key={feat} className="flex justify-between text-text-main/70">
                        <span>{feat}</span>
                        <span className="font-mono">{(score as number).toFixed(3)}</span>
                      </div>
                    ))}
                    {Object.keys(run.feature_scores).length > 5 && (
                      <p className="text-text-main/50 italic">+{Object.keys(run.feature_scores).length - 5} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {run.error_message && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-500">
              {run.error_message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
