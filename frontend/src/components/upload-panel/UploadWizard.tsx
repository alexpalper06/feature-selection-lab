// src/components/datasets/UploadWizard.tsx
import React, { useState, useCallback } from 'react';
import { CheckCircle2, ChevronLeft, Database, Target, FileText } from 'lucide-react';
import Modal from '../ui/Modal.tsx';
import Button from '../ui/Button.tsx';
import Badge from '../ui/Badge.tsx';
import Spinner from '../ui/Spinner.tsx';
import DropZone from './DropZone.tsx';
import PreviewTable from '../datasets/PreviewTable.tsx';
import { datasetApi } from '../../client/DatasetClient.ts';
import  type { DatasetRead, FileAnalysisResponse } from '../../client/types.ts'; // Adjust import path as needed

const STEP = { FILE_SELECT: 0, CONFIGURE: 1, SUCCESS: 2 } as const;

const STEP_LABELS = ['Upload File', 'Configure', 'Done'] as const;

/** Strip file extension from a filename to use as a default dataset name */
const stripExt = (filename: string): string => filename.replace(/\.[^/.]+$/, '');

interface UploadWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (dataset: DatasetRead) => void;
}

export default function UploadWizard({
  isOpen,
  onClose,
  onSuccess,
}: UploadWizardProps): React.ReactElement {
  const [step, setStep] = useState<number>(STEP.FILE_SELECT);

  // Step 1 state
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Step 2 form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [targetVars, setTargetVars] = useState<Set<string>>(new Set());

  // Step 2 → Step 3 state
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [createdDataset, setCreatedDataset] = useState<DatasetRead | null>(null);


  const reset = useCallback((): void => {
    setStep(STEP.FILE_SELECT);
    setFile(null);
    setAnalysis(null);
    setAnalyzing(false);
    setAnalyzeError(null);
    setName('');
    setDescription('');
    setTargetVars(new Set());
    setUploading(false);
    setUploadError(null);
    setCreatedDataset(null);
  }, []);

  const handleClose = (): void => {
    reset();
    onClose();
  };


  /** Step 1 select file and analyze */
  const handleFileSelect = async (selectedFile: File): Promise<void> => {
    setFile(selectedFile);
    setAnalyzeError(null);
    setAnalyzing(true);
    try {
      const result = await datasetApi.analyze(selectedFile);
      setAnalysis(result);
      setName(stripExt(selectedFile.name));
      setStep(STEP.CONFIGURE);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  /** Step 2 toggle a column's target status */
  const toggleTarget = (col: string): void =>
    setTargetVars((prev) => {
      const next = new Set(prev);
      next.has(col) ? next.delete(col) : next.add(col);
      return next;
    });

  /** Step 3 submit */
  const handleUpload = async (): Promise<void> => {
    if (!name.trim() || !file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const dataset = await datasetApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        targetVariables: Array.from(targetVars),
        file,
      });
      setCreatedDataset(dataset);
      setStep(STEP.SUCCESS);
      onSuccess?.(dataset);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const modalSize = step === STEP.CONFIGURE ? 'xl' : 'md';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={STEP_LABELS[step]}
      size={modalSize}
    >
      {/* Progress bar (steps 0 and 1 only) */}
      {step < STEP.SUCCESS && (
        <div className="flex items-center gap-0 px-6 pt-5 pb-0">
          {[STEP.FILE_SELECT, STEP.CONFIGURE].map((s) => {
            const done = step > s;
            const active = step === s;
            return (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center gap-2 text-xs font-medium transition-colors
                  ${
                    active
                      ? 'text-accent'
                      : done
                        ? 'text-accent/60'
                        : 'text-text-main/40'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border transition-all
                    ${
                      active
                        ? 'bg-accent text-white border-accent'
                        : done
                          ? 'bg-accent/20 text-accent border-accent/40'
                          : 'border-border-main'
                    }`}
                  >
                    {done ? '✓' : s + 1}
                  </span>
                  {STEP_LABELS[s]}
                </div>
                {s === STEP.FILE_SELECT && (
                  <div
                    className={`flex-1 h-px mx-3 transition-colors ${done ? 'bg-accent/40' : 'bg-border-main'}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}


      {/* STEP 1 — File Select                            */}
      {step === STEP.FILE_SELECT && (
        <div className="p-6">
          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Spinner size="lg" className="text-accent" />
              <p className="text-sm text-text-main/50">Analysing file structure…</p>
            </div>
          ) : (
            <DropZone onFileSelect={handleFileSelect} error={analyzeError || undefined} />
          )}
        </div>
      )}

      {/* STEP 2 — Configure                              */}
      {step === STEP.CONFIGURE && analysis && (
        <div className="flex flex-col min-h-0">
          {/* Two-column body */}
          <div className="flex gap-6 p-6 min-h-0 flex-1">
            {/* Left — Data Preview */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <p className="text-xs font-semibold text-text-h uppercase tracking-wider flex items-center gap-2 flex-shrink-0">
                <FileText className="w-3.5 h-3.5" />
                Data Preview
                <span className="ml-auto text-text-main/40 font-normal normal-case">
                  {analysis.num_rows.toLocaleString()} rows × {analysis.num_cols} cols
                </span>
              </p>
              <PreviewTable
                columns={analysis.columns}
                rows={analysis.rows}
                highlightColumns={Array.from(targetVars)}
              />
              <p className="text-xs text-text-main/40 flex-shrink-0">
                ● Highlighted columns = selected targets
              </p>
            </div>

            {/* Right — Configuration form */}
            <div className="w-72 flex flex-col gap-5 flex-shrink-0">
              {/* Dataset name */}
              <div>
                <label className="block text-xs font-semibold text-text-h mb-1.5">
                  Dataset Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. iris_dataset"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-code-bg border border-border-main text-text-h placeholder:text-text-main/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-text-h mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Optional notes about this dataset…"
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-code-bg border border-border-main text-text-h placeholder:text-text-main/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                />
              </div>

              {/* Target variables multi-select */}
              <div className="flex flex-col gap-1.5 min-h-0">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-text-h flex-shrink-0">
                  <Target className="w-3.5 h-3.5 text-accent" />
                  Target Variables
                  {targetVars.size > 0 && (
                    <Badge color="blue" className="ml-auto">
                      {targetVars.size} selected
                    </Badge>
                  )}
                </label>
                <div className="border border-border-main rounded-lg overflow-hidden overflow-y-auto max-h-56 bg-code-bg">
                  {analysis.columns.map((col) => {
                    const checked = targetVars.has(col);
                    return (
                      <label
                        key={col}
                        className={[
                          'flex items-center gap-2.5 px-3 py-2 cursor-pointer text-xs transition-colors',
                          'border-b border-border-main last:border-0',
                          checked
                            ? 'bg-accent-bg text-accent'
                            : 'hover:bg-accent-bg/40 text-text-main',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTarget(col)}
                          className="w-3.5 h-3.5 rounded"
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        <span className="font-mono truncate">{col}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Upload error */}
          {uploadError && (
            <div className="mx-6 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500">
              {uploadError}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-main flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronLeft}
              onClick={reset}
            >
              Change file
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Database}
              loading={uploading}
              disabled={!name.trim()}
              onClick={handleUpload}
            >
              Upload Dataset
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 — Success                                */}
      {step === STEP.SUCCESS && createdDataset && (
        <div className="p-8 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-text-h">
              {createdDataset.name}
            </h3>
            <p className="text-sm text-text-main/50 mt-1">
              Dataset uploaded successfully
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <div className="bg-code-bg rounded-lg p-3">
              <p className="text-xl font-bold text-text-h">
                {createdDataset.num_rows.toLocaleString()}
              </p>
              <p className="text-xs text-text-main/50">Rows</p>
            </div>
            <div className="bg-code-bg rounded-lg p-3">
              <p className="text-xl font-bold text-text-h">
                {createdDataset.num_cols}
              </p>
              <p className="text-xs text-text-main/50">Columns</p>
            </div>
          </div>

          {createdDataset.target_variables.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {createdDataset.target_variables.map((t) => (
                <Badge key={t} color="blue">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          <Button
            variant="primary"
            className="mt-1 w-full max-w-xs"
            onClick={handleClose}
          >
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
