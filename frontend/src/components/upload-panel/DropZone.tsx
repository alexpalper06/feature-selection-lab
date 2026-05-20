import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  error?: string;
  disabled?: boolean;
}

export default function DropZone({
  onFileSelect,
  accept = '.csv,.tsv,.xlsx',
  error,
  disabled = false,
}: DropZoneProps): React.ReactElement {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>): void => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect, disabled]
  );

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>): void => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (): void => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.currentTarget.files?.[0];
    if (file) onFileSelect(file);
    e.currentTarget.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <label
        className={[
          'relative flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-code-bg/50',
          error ? 'border-red-500/50 bg-red-500/5' : isDragging ? 'border-accent' : 'border-border-main',
        ].join(' ')}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div
          className={[
            'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
            isDragging ? 'bg-accent/20' : error ? 'bg-red-500/10' : 'bg-code-bg',
          ].join(' ')}
        >
          {error ? (
            <AlertCircle className="w-7 h-7 text-red-500" />
          ) : (
            <Upload
              className={`w-7 h-7 transition-colors ${isDragging ? 'text-accent' : 'text-text-main/30'}`}
            />
          )}
        </div>

        <div className="text-center space-y-1 mt-3">
          <p className="text-sm font-semibold text-text-h">
            {isDragging ? 'Release to analyse' : 'Drop your dataset here'}
          </p>
          <p className="text-xs text-text-main/50">or click to browse files</p>
          <p className="text-xs text-text-main/30 mt-1">CSV · TSV · XLSX</p>
        </div>

        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />
      </label>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}