import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Spinner from '../components/ui/Spinner';
import TabNavigation from '../components/dataset-panel/TabNavigation';
import DetailedViewTab from '../components/dataset-panel/DetailedViewTab';
import ConfigurationTab from '../components/dataset-panel/ConfigurationTab';
import HistoryTab from '../components/dataset-panel/HistoryTab';
import ComparisonsTab from '../components/dataset-panel/ComparisonsTab';
import { datasetApi } from '../client/DatasetClient';
import type { DatasetPreview } from '../client/types';

type TabId = 'detailed' | 'configure' | 'history' | 'comparisons';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'detailed', label: 'Detailed View' },
  { id: 'configure', label: 'Configuration' },
  { id: 'history', label: 'Execution History' },
  { id: 'comparisons', label: 'Comparisons' },
];

export default function DatasetPanelPage(): React.ReactElement {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<DatasetPreview | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('detailed');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataset = useCallback(async (): Promise<void> => {
    if (!datasetId) return;

    setLoading(true);
    setError(null);
    try {
      const id = parseInt(datasetId, 10);
      const data = await datasetApi.preview(id);
      setDataset(data);
    } catch (err: any) {
      setError(err.message || 'Could not fetch dataset details.');
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset]);

  if (loading) {
    return (
      <AppLayout breadcrumbs={[{ label: 'Datasets', href: '/datasets' }]}>
        <div className="py-24 flex justify-center">
          <Spinner />
        </div>
      </AppLayout>
    );
  }

  if (error || !dataset) {
    return (
      <AppLayout breadcrumbs={[{ label: 'Datasets', href: '/datasets' }]}>
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error || 'Dataset not found.'}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Datasets', href: '/datasets' },
        { label: dataset.name }
      ]}
    >
{/* Centered Page Layout Wrapper */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-w-0 h-full overflow-hidden">

  {/* Tab Navigation Section */}
  <div className="shrink-0 mb-6">
    <TabNavigation tabs={TABS} active={activeTab} onChange={setActiveTab} />
  </div>

  {/* Tab Content Window - Strictly limited to available horizontal & vertical space */}
  <div className="flex-1 min-w-0 min-h-0 w-full overflow-hidden bg-bg-main">
    {activeTab === 'detailed' && <DetailedViewTab dataset={dataset} />}
    {activeTab === 'configure' && (
      <ConfigurationTab dataset={dataset} onRunCreated={() => setActiveTab('history')} />
    )}
    {activeTab === 'history' && <HistoryTab datasetId={dataset.id} />}
    {activeTab === 'comparisons' && <ComparisonsTab dataset={dataset} />}
  </div>

</div>
    </AppLayout>
  );
}
