import 'react';
import {useNavigate} from 'react-router-dom';
import {Database, Upload, BarChart2} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';

export default function DashboardPage() {
    const navigate = useNavigate();

    return (
        <AppLayout breadcrumbs={[{label: 'Dashboard'}]}>
            <div className="max-w-4xl mx-auto space-y-8 py-4">
                {/* Welcome Page */}
                <div
                    className="bg-gradient-to-br from-accent-bg via-transparent to-transparent border border-border-main rounded-2xl p-8 space-y-4 bg-surface">
                    <h1 className="text-3xl font-extrabold text-text-h tracking-tight ">
                        Welcome to Feature Selector Lab
                    </h1>

                    <p className="text-base text-text-main/80 max-w-2xl leading-relaxed mx-auto">
                        Upload preprocessed classification datasets, analyze class distribution, and execute feature
                        selection algorithms.
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

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Card 1 */}
                    <div className="border border-border-main rounded-xl p-5 space-y-3 bg-surface text-center">
                        <div className="flex items-center gap-3 justify-center">
                            <div
                                className="w-10 h-10 rounded-lg bg-accent-bg flex items-center justify-center border border-accent-border shrink-0">
                                <Database className="w-5 h-5 text-accent"/>
                            </div>
                            <h2 className="text-base font-semibold text-text-h text-center">Dataset Management</h2>
                        </div>
                        <p className="text-sm text-text-main/75 leading-relaxed">
                            Manage a repository of datasets. Preview structures, target attributes and its
                            dimensionality.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="border border-border-main bg-surface rounded-xl p-5 space-y-3 text-center">
                        <div className="flex items-center gap-3 justify-center">
                            <div
                                className="w-10 h-10 rounded-lg bg-accent-bg flex items-center justify-center border border-accent-border shrink-0">
                                <BarChart2 className="w-5 h-5 text-accent"/>
                            </div>
                            <h2 className="text-base font-semibold text-text-h text-center">Feature Analysis</h2>
                        </div>
                        <p className="text-sm text-text-main/75 leading-relaxed">
                            Compare performance across Filter and Wrapper Selection methods like Chi-Square, RFECV and
                            Forward Selection.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}