// src/pages/DashboardPage.tsx
import 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Upload, BarChart2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <AppLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        {/* Welcome Hero */}
        <div className="bg-gradient-to-br from-accent-bg via-transparent to-transparent border border-accent-border/30 rounded-2xl p-8 space-y-4">
          <h1 className="text-3xl font-extrabold text-text-h tracking-tight ">
            Welcome to Feature Selector Lab
          </h1>

          <p className="text-base text-text-main/80 max-w-2xl leading-relaxed mx-auto">
            Upload preprocessed classification datasets, analyze feature variance, and execute feature selection algorithms to optimize your data models.
          </p>
          <div className="flex gap-3 pt-2 justify-center">
            <Button variant="primary" icon={Upload} onClick={() => navigate('/datasets/upload')}>
              Upload Dataset
            </Button>
            <Button variant="secondary" onClick={() => navigate('/datasets')}>
              View Repository
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="border border-border-main rounded-xl p-5 space-y-3 bg-code-bg/10">
            <div className="w-10 h-10 rounded-lg bg-accent-bg flex items-center justify-center border border-accent-border">
              <Database className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-base font-semibold text-text-h">Dataset Management</h2>
            <p className="text-sm text-text-main/60 leading-relaxed">
              Maintain an isolated repository of high-dimensional datasets. Preview structures, target labels, and shapes on demand.
            </p>
          </div>

          <div className="border border-border-main rounded-xl p-5 space-y-3 bg-code-bg/10">
            <div className="w-10 h-10 rounded-lg bg-accent-bg flex items-center justify-center border border-accent-border">
              <BarChart2 className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-base font-semibold text-text-h">Feature Analysis</h2>
            <p className="text-sm text-text-main/60 leading-relaxed">
              Compare ranking distributions across Filter and Wrapper paradigms like SelectKBest, Lasso regularization, and RFE.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}