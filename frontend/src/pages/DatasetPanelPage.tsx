// src/pages/DatasetPanelPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, Sliders, History, BarChart3 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Spinner from '../components/ui/Spinner';
import TabNavigation from '../components/dataset-panel/TabNavigation';
import DetailedViewTab from '../components/dataset-panel/DetailedViewTab';
import ConfigurationTab from '../components/dataset-panel/ConfigurationTab';
import HistoryTab from '../components/dataset-panel/HistoryTab';
import ComparisonsTab from '../components/dataset-panel/ComparisonsTab';
import { datasetApi } from '../client/DatasetClient';
import type { DatasetDetails } from '../client/types';

type TabId = 'detailed' | 'configure' | 'history' | 'comparisons';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'detailed', label: 'Detailed View', icon: Eye },
  { id: 'configure', label: 'Configuration', icon: Sliders },
  { id: 'history', label: 'Execution History', icon: History },
  { id: 'comparisons', label: 'Comparisons', icon: BarChart3 },
];

export default function DatasetPanelPage(): React.ReactElement {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<DatasetDetails | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('detailed');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataset = useCallback(async (): Promise<void> => {
    if (!datasetId) return;

    setLoading(true);
    setError(null);
    try {
      const id = parseInt(datasetId, 10);
      const data = await datasetApi.get(id);
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
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm max-w-4xl mx-auto mt-6">
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
      {/* Full-width container with natural scrolling and guarded horizontal overflow */}
      <div className="w-full flex flex-col min-w-0 overflow-x-hidden">

        {/* Header / Tab Navigation Section - Flush standard layout */}
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-4  border-border-main bg-bg-main">
          <div className="max-w-7xl mx-auto w-full">
            <TabNavigation tabs={TABS} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />
          </div>
        </div>

        {/* Tab Content Window - Responsive padding and constrained inner width */}
        <div className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto w-full">
            {activeTab === 'detailed' && <DetailedViewTab dataset={dataset} />}
            {activeTab === 'configure' && (
              <ConfigurationTab dataset={dataset} onRunCreated={() => setActiveTab('history')} />
            )}
            {activeTab === 'history' && <HistoryTab datasetId={dataset.id} />}
            {activeTab === 'comparisons' && <ComparisonsTab dataset={dataset} />}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}