import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, BarChart3 } from 'lucide-react';
import Spinner from '../ui/Spinner';
import RunCard from './RunCard';
import { fsRunApi } from '../../client/FsRunClient';
import type { FSRunRead } from '../../client/types';

interface HistoryTabProps {
  datasetId: number;
}

export default function HistoryTab({ datasetId }: HistoryTabProps): React.ReactElement {
  const [runs, setRuns] = useState<FSRunRead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fsRunApi.list(datasetId);
      setRuns(data);
    } catch (err: any) {
      setError(err.message || 'Could not fetch execution history.');
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const handleDelete = (deletedId: number): void => {
    setRuns((prev) => prev.filter((r) => r.id !== deletedId));
  };

  const handleRename = (updated: FSRunRead): void => {
    setRuns((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

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
          <BarChart3 className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-semibold text-text-h">No executions yet</h3>
          <p className="text-xs text-text-main/50 max-w-xs">
            Configure and run feature selection methods from the Configuration tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {runs.map((run) => (
        <RunCard
          key={run.id}
          run={run}
          datasetId={datasetId}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      ))}
    </div>
  );
}
