import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import Spinner from '../ui/Spinner';
import Badge from '../ui/Badge';
import { fsRunApi } from '../../client/FsRunClient';
import type { FSRunRead, DatasetRead } from '../../client/types';

interface ComparisonsTabProps {
  dataset: DatasetRead;
}

export default function ComparisonsTab({ dataset }: ComparisonsTabProps): React.ReactElement {
  const [runs, setRuns] = useState<FSRunRead[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>(dataset.target_variables[0] || '');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fsRunApi.list(dataset.id);
      setRuns(data.filter((r) => r.status === 'completed'));
    } catch (err: any) {
      setError(err.message || 'Could not fetch runs for comparison.');
    } finally {
      setLoading(false);
    }
  }, [dataset.id]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const filteredRuns = runs.filter((r) => r.target_var === selectedTarget);

  if (loading) {
    return <div className="py-24 flex justify-center"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-border-main rounded-xl">
        <div className="w-12 h-12 rounded-full bg-accent-bg flex items-center justify-center text-accent/50">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-semibold text-text-h">No completed runs</h3>
          <p className="text-xs text-text-main/50 max-w-xs">
            Complete at least one feature selection execution to compare results.
          </p>
        </div>
      </div>
    );
  }

  if (filteredRuns.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-border-main rounded-xl">
        <div className="w-12 h-12 rounded-full bg-accent-bg flex items-center justify-center text-accent/50">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-semibold text-text-h">Need more runs</h3>
          <p className="text-xs text-text-main/50 max-w-xs">
            At least 2 completed runs are required to compare results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Target Variable Filter */}
      <div>
        <label className="block text-sm font-medium text-text-h mb-2">Filter by Target Variable</label>
        <select
          value={selectedTarget}
          onChange={(e) => setSelectedTarget(e.target.value)}
          className="w-full md:w-64 h-9 px-3 text-sm rounded-lg bg-code-bg border border-border-main text-text-h focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        >
          {dataset.target_variables.map((target) => (
            <option key={target} value={target}>
              {target}
            </option>
          ))}
        </select>
      </div>

      {/* Comparison Table */}
      <div>
        <h3 className="text-sm font-semibold text-text-h mb-3">Method Comparison</h3>
        <div className="border border-border-main rounded-lg overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-code-bg border-b border-border-main">
                <th className="px-4 py-2.5 text-left font-semibold text-text-h">Run Name</th>
                <th className="px-4 py-2.5 text-left font-semibold text-text-h">Method</th>
                <th className="px-4 py-2.5 text-right font-semibold text-text-h">Accuracy</th>
                <th className="px-4 py-2.5 text-right font-semibold text-text-h">Features</th>
                <th className="px-4 py-2.5 text-right font-semibold text-text-h">Time (s)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run, idx) => (
                <tr
                  key={run.id}
                  className={[
                    'border-b border-border-main last:border-0 transition-colors',
                    idx % 2 === 0 ? 'bg-bg-main' : 'bg-code-bg/40'
                  ].join(' ')}
                >
                  <td className="px-4 py-2 text-text-h font-medium">{run.name}</td>
                  <td className="px-4 py-2">
                    <Badge color="blue">{run.method_name}</Badge>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-accent">
                    {run.accuracy !== null ? `${(run.accuracy * 100).toFixed(2)}%` : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-text-main">
                    {run.num_selected_features !== null ? run.num_selected_features : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-text-main">
                    {run.execution_time ? run.execution_time.toFixed(2) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Reduction Comparison */}
      <div>
        <h3 className="text-sm font-semibold text-text-h mb-3">Feature Reduction Summary</h3>
        <div className="space-y-2">
          {filteredRuns.map((run) => {
            const reductionPct =
              run.num_selected_features !== null
                ? (((dataset.num_cols - run.num_selected_features) / dataset.num_cols) * 100).toFixed(1)
                : null;

            return (
              <div key={run.id} className="bg-code-bg/40 p-3 rounded-lg border border-border-main">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-h">{run.name}</span>
                  {reductionPct && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      {reductionPct}% reduction
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-border-main rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{
                        width: `${((run.num_selected_features || 0) / dataset.num_cols) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-text-main/60 font-mono">
                    {run.num_selected_features || 0}/{dataset.num_cols}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-code-bg/40 border-2 border-dashed border-border-main rounded-lg p-8 text-center">
        <TrendingUp className="w-8 h-8 text-text-main/30 mx-auto mb-2" />
        <p className="text-sm text-text-main/50">Advanced comparison charts coming soon</p>
      </div>
    </div>
  );
}
