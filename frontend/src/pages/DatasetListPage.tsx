import React, {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {Plus, Database, RefreshCw, AlertCircle} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import DatasetCard from '../components/datasets/DatasetCard';
import {datasetApi} from '../client/DatasetClient';
import type {DatasetRead} from '../client/types/DatasetTypes.ts';

export default function DatasetListPage(): React.ReactElement {
    const navigate = useNavigate();
    const [datasets, setDatasets] = useState<DatasetRead[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDatasets = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const data = await datasetApi.list();
            setDatasets(data);
        } catch (err: any) {
            setError(err.message || 'Could not fetch records.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDatasets();
    }, [fetchDatasets]);

    const handleDelete = (deletedId: number): void =>
        setDatasets((prev) => prev.filter((d) => d.id !== deletedId));

    const handleRename = (updated: DatasetRead): void =>
        setDatasets((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

    return (
        <AppLayout breadcrumbs={[{label: 'Datasets'}]}>
            <div className="space-y-6">
                <div className="items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-text-h">Dataset Repositories</h1>
                        <p className="text-xs text-text-main/50">Manage uploaded data sources configured for feature selection</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" icon={RefreshCw} onClick={fetchDatasets} disabled={loading}>
                        Sync
                    </Button>
                    <Button variant="primary" icon={Plus} onClick={() => navigate('/datasets/upload')}>
                        New Dataset
                    </Button>
                </div>

                {loading ? (
                    <div className="py-24 flex justify-center"><Spinner/></div>
                ) : error ? (
                    <div
                        className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0"/>
                        <p>{error}</p>
                    </div>
                ) : datasets.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-border-main rounded-xl">
                        <div
                            className="w-12 h-12 rounded-full bg-accent-bg flex items-center justify-center text-accent/50">
                            <Database className="w-6 h-6"/>
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-sm font-semibold text-text-h">No datasets configured</h3>
                            <p className="text-xs text-text-main/50 max-w-xs">Upload your dataset to
                                evaluate feature selection methods.</p>
                        </div>
                        <Button variant="primary" icon={Plus} onClick={() => navigate('/datasets/upload')}>
                            Upload Your First Dataset
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {datasets.map((dataset) => (
                            <DatasetCard
                                key={dataset.id}
                                dataset={dataset}
                                onDelete={handleDelete}
                                onRename={handleRename}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}