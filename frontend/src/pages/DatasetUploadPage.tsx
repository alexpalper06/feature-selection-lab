// src/pages/DatasetUploadPage.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Target, FileText, CheckCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import DropZone from '../components/datasets/DropZone';
import PreviewTable from '../components/datasets/PreviewTable';
import { datasetApi } from '../client/DatasetClient';
import type { FileAnalysisResponse } from '../client/types';

const STEP = { FILE_SELECT: 0, CONFIGURE: 1, SUCCESS: 2 } as const;
const stripExt = (filename: string): string => filename.replace(/\.[^/.]+$/, '');

export default function DatasetUploadPage(): React.ReactElement {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(STEP.FILE_SELECT);

  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [targets, setTargets] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  const handleFileSelect = useCallback(async (selectedFile: File): Promise<void> => {
    setFile(selectedFile);
    setAnalyzing(true);
    setError(null);
    try {
      const data = await datasetApi.analyze(selectedFile);
      setAnalysis(data);
      setName(stripExt(selectedFile.name));
      setStep(STEP.CONFIGURE);
      setDescription('')
      setTargets([])
    } catch (err: any) {
      setError(err.message || 'Analysis mapping failed.');
      setFile(null);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const toggleTarget = (columnName: string): void => {
    setTargets((prev) =>
      prev.includes(columnName) ? prev.filter((c) => c !== columnName) : [...prev, columnName]
    );
  };

  const handleCommitSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!file || !name.trim() || targets.length === 0) return;

    setSaving(true);
    setError(null);
    try {
      await datasetApi.create({
        name: name.trim(),
        description: description.trim(),
        targetVariables: targets,
        file,
      });
      setStep(STEP.SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Failed to save dataset.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Datasets', href: '/datasets' }, { label: 'Upload Dataset' }]}>
      <div className="max-w-4xl mx-auto bg-bg-main border border-border-main rounded-xl shadow-sm overflow-hidden">

        <div className="border-b border-border-main bg-code-bg/30 px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-text-h">Step {step + 1} of 3</span>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${step >= i ? 'bg-accent' : 'bg-border-main'}`} />
            ))}
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === STEP.FILE_SELECT && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto space-y-1 py-4">
                <h2 className="text-lg font-bold text-text-h">Stage Your Data File</h2>
                <p className="text-xs text-text-main/60">Upload local tabular data to structure predictors and structural shapes.</p>
              </div>
              {analyzing ? (
                <div className="py-12 flex flex-col items-center gap-3"><Spinner /><p className="text-xs text-text-main/50">Parsing architecture metrics...</p></div>
              ) : (
                <DropZone onFileSelect={handleFileSelect} />
              )}
            </div>
          )}

          {step === STEP.CONFIGURE && analysis && (
            <form onSubmit={handleCommitSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-1">Dataset Alias *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full text-sm px-3 py-2 bg-code-bg border border-border-main rounded-lg focus:outline-none focus:border-accent text-text-h" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-h mb-1">Optional Notes</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full text-sm px-3 py-2 bg-code-bg border border-border-main rounded-lg focus:outline-none focus:border-accent text-text-h" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-h mb-1 flex items-center gap-1"><Target className="w-3 h-3 text-accent" /> Assign Target Classification Vector *</label>
                <p className="text-xs text-text-main/50 mb-2">Select features representing discrete targets to isolate them from prediction spaces.</p>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-code-bg/40 border border-border-main rounded-lg">
                  {analysis.columns.map((col) => {
                    const isSel = targets.includes(col);
                    return (
                      <button key={col} type="button" onClick={() => toggleTarget(col)} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${isSel ? 'bg-accent text-white' : 'bg-code-bg text-text-main hover:bg-border-main'}`}>
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-h flex items-center gap-1"><FileText className="w-3 h-3" /> Structure Preview ({analysis.num_rows} rows × {analysis.num_cols} metrics)</label>
                <PreviewTable columns={analysis.columns} rows={analysis.rows} highlightColumns={targets} />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border-main">
                <Button variant="secondary" icon={ChevronLeft} onClick={() => setStep(STEP.FILE_SELECT)}>Change Matrix File</Button>
                <Button variant="primary" type="submit" disabled={saving || targets.length === 0}>
                  {saving ? 'Persisting to Storage...' : 'Save Dataset'}
                </Button>
              </div>
            </form>
          )}

          {step === STEP.SUCCESS && (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle className="w-6 h-6" /></div>
              <div>
                <h3 className="text-base font-semibold text-text-h">Upload Confirmed</h3>
                <p className="text-xs text-text-main/50 mt-0.5">The structural matrices have been written to filesystems and registered cleanly.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" onClick={() => setStep(STEP.FILE_SELECT)}>Upload Another</Button>
                <Button variant="primary" onClick={() => navigate('/datasets')}>Go to Repository</Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}