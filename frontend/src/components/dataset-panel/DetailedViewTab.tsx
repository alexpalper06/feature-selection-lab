import React from 'react';
import { Target } from 'lucide-react';
import Badge from '../ui/Badge';
import PreviewTable from '../datasets/PreviewTable';
import type { DatasetPreview } from '../../client/types';

interface DetailedViewTabProps {
  dataset: DatasetPreview;
}

export default function DetailedViewTab({ dataset }: DetailedViewTabProps): React.ReactElement {
  return (
    <div className="flex flex-col h-full space-y-6 w-full min-w-0">
      {/* Metadata Section */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-code-bg rounded-lg p-4 border border-border-main">
          <p className="text-xs text-text-main/50 mb-2">Total Rows</p>
          <p className="text-2xl font-bold text-text-h">{dataset.num_rows.toLocaleString()}</p>
        </div>
        <div className="bg-code-bg rounded-lg p-4 border border-border-main">
          <p className="text-xs text-text-main/50 mb-2">Total Columns</p>
          <p className="text-2xl font-bold text-text-h">{dataset.num_cols}</p>
        </div>
        <div className="bg-code-bg rounded-lg p-4 border border-border-main">
          <p className="text-xs text-text-main/50 mb-2">Uploaded</p>
          <p className="text-sm font-semibold text-text-h">
            {new Date(dataset.uploaded_at).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-code-bg rounded-lg p-4 border border-border-main">
          <p className="text-xs text-text-main/50 mb-2">Dataset ID</p>
          <p className="text-sm font-mono font-semibold text-text-h">#{dataset.id}</p>
        </div>
      </div>

      {/* Target Variables */}
      <div className="shrink-0">
        <h3 className="text-sm font-semibold text-text-h mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Target Variables
        </h3>
        {dataset.target_variables.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dataset.target_variables.map((target) => (
              <Badge key={target} color="blue">
                {target}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-main/50 italic">No target variables selected</p>
        )}
      </div>

      {/* Data Preview */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full overflow-hidden">
        <h3 className="text-sm font-semibold text-text-h mb-3 shrink-0">Data Preview</h3>
        <div className="flex-1 min-h-0 min-w-0 w-full rounded-lg border border-border-main overflow-hidden">
          <PreviewTable
            columns={dataset.columns}
            rows={dataset.rows}
            highlightColumns={dataset.target_variables}
            className="h-full w-full border-0"
          />
        </div>
      </div>

      {/* Dataset Description */}
      {dataset.description && (
        <div className="shrink-0 pb-4">
          <h3 className="text-sm font-semibold text-text-h mb-2">Description</h3>
          <p className="text-sm text-text-main/80">{dataset.description}</p>
        </div>
      )}
    </div>
  );
}