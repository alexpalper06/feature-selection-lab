import React, {useState, useEffect, useCallback} from 'react';
import {AlertCircle, BarChart3, Filter, RefreshCw} from 'lucide-react';
import Spinner from '../ui/Spinner';
import RunCard from './RunCard';
import {fsRunApi} from '../../client/FsRunClient';

import type {FSRunRead} from "../../client/types/FsRunTypes.ts";

interface HistoryTabProps {
    datasetId: number;
    targetVariables?: string[]; // Prop defined to capture target variables from the dataset view panel
}

export default function HistoryTab({datasetId, targetVariables = []}: HistoryTabProps): React.ReactElement {
    const [runs, setRuns] = useState<FSRunRead[]>([]);
    const [selectedTargetFilter, setSelectedTargetFilter] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    // Fetch data when selected target to filter changes
    const fetchRuns = useCallback(async (showSyncIndicator = false): Promise<void> => {
        if (showSyncIndicator) {
            setIsSyncing(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const data = await fsRunApi.list(datasetId, selectedTargetFilter || undefined);
            setRuns(data);
        } catch (err: any) {
            setError(err.message || 'Could not obtain Feature Selection executions list.');
        } finally {
            setLoading(false);
            setIsSyncing(false);
        }
    }, [datasetId, selectedTargetFilter]);

    // Synchronously fetch whenever selectedTargetFilter updates
    useEffect(() => {
        fetchRuns();
    }, [fetchRuns]);

    const handleSyncClick = (): void => {
        fetchRuns(true);
    };

    const handleDelete = (deletedId: number): void => {
        setRuns((prev) => prev.filter((run) => run.id !== deletedId));
    };

    const handleRename = (updated: FSRunRead): void => {
        setRuns((prev) => prev.map((run) => (run.id === updated.id ? updated : run)));
    };

    if (loading && !isSyncing) {
        return <div className="py-24 flex justify-center"><Spinner/></div>;
    }

    return (
        <div className="space-y-5 w-full min-w-0">

            {/* Target Variable Select Filter and Sync Action Button */}
            <div
                className="flex flex-col sm:flex-row items-stretch shadow-2xs sm:items-center justify-between gap-3 p-4 border border-border-main rounded-xl bg-surface">
                <div className="flex items-center gap-2 min-w-0">
                    <Filter className="w-4 h-4 text-text-main/50 shrink-0"/>
                    <span className="text-xs font-semibold text-text-main/70 hidden md:inline whitespace-nowrap">
            Filter Target Attribute:
          </span>
                    <select
                        value={selectedTargetFilter}
                        onChange={(e) => setSelectedTargetFilter(e.target.value)}
                        className="h-8 px-3 pr-8 text-xs font-medium rounded-lg bg-code-bg border
                                   border-border-main text-text-h focus:outline-none focus:border-accent
                                   cursor-pointer transition-all w-full sm:w-48"
                    >
                        <option value="">All Targets</option>
                        {targetVariables.map((target) => (
                            <option key={target} value={target}>
                                {target}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSyncClick}
                    disabled={isSyncing}
                    className="h-8 px-4 flex items-center justify-center gap-2 text-xs font-semibold rounded-lg
                               bg-code-bg border border-border-main text-text-main hover:text-text-h hover:bg-border-main/20
                               disabled:opacity-50 transition-all cursor-pointer select-none shrink-0"
                    title="Refresh status entries"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-accent' : ''}`}/>
                    {isSyncing ? 'Syncing...' : 'Sync List'}
                </button>
            </div>

            {/* Main Panel */}
            {error ? (
                <div
                    className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0"/>
                    <p className="text-xs font-medium">{error}</p>
                </div>
            ) : runs.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-border-main rounded-xl">
                    <div
                        className="w-12 h-12 rounded-full bg-accent-bg flex items-center justify-center text-accent/50">
                        <BarChart3 className="w-6 h-6"/>
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-sm font-semibold text-text-h">No Feature Selection executions found</h3>
                        <p className="text-xs text-text-main/60 max-w-xs px-4">
                            {selectedTargetFilter
                                ? 'No evaluations matching this targeted attribute found.'
                                : 'Configure and execute Feature Selection runs through the Configuration tab.'}
                        </p>
                    </div>
                </div>
            ) : (
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
            )}
        </div>
    );
}