import React, { useState } from 'react';
import { AlertCircle, Play } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { fsRunApi } from '../../client/FsRunClient';
import { MethodCategory } from '../../client/types';
import type { DatasetRead, FSRunCreate } from '../../client/types';

interface ConfigurationTabProps {
  dataset: DatasetRead;
  onRunCreated?: () => void;
}

const METHODS = [
  { name: 'Chi-Square', category: MethodCategory.FILTER, description: 'Statistical feature selection for classification' },
  { name: 'RFE', category: MethodCategory.WRAPPER, description: 'Recursive Feature Elimination' },
  { name: 'Mutual Information', category: MethodCategory.FILTER, description: 'Information-theoretic feature ranking' },
  { name: 'Forward Selection', category: MethodCategory.WRAPPER, description: 'Iterative forward feature selection' },
];

const METHOD_PARAMETERS: Record<string, Array<{ name: string; type: string; default: any; label: string }>> = {
  'Chi-Square': [
    { name: 'k', type: 'number', default: 10, label: 'Number of features to select' },
  ],
  'RFE': [
    { name: 'k', type: 'number', default: 10, label: 'Number of features to select' },
    { name: 'step', type: 'number', default: 1, label: 'Number of features to eliminate per iteration' },
  ],
  'Mutual Information': [
    { name: 'k', type: 'number', default: 10, label: 'Number of features to select' },
  ],
  'Forward Selection': [
    { name: 'k', type: 'number', default: 10, label: 'Number of features to select' },
    { name: 'cv_folds', type: 'number', default: 5, label: 'Cross-validation folds' },
  ],
};

export default function ConfigurationTab({ dataset, onRunCreated }: ConfigurationTabProps): React.ReactElement {
  const [runName, setRunName] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('Chi-Square');
  const [selectedTarget, setSelectedTarget] = useState<string>(dataset.target_variables[0] || '');
  const [parameters, setParameters] = useState<Record<string, any>>(
    METHOD_PARAMETERS['Chi-Square']?.reduce((acc, p) => ({ ...acc, [p.name]: p.default }), {}) || {}
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const currentMethod = METHODS.find((m) => m.name === selectedMethod)!;
  const methodParams = METHOD_PARAMETERS[selectedMethod] || [];

  const handleMethodChange = (methodName: string): void => {
    setSelectedMethod(methodName);
    const newParams = (METHOD_PARAMETERS[methodName] || []).reduce(
      (acc, p) => ({ ...acc, [p.name]: p.default }),
      {}
    );
    setParameters(newParams);
  };

  const handleParameterChange = (paramName: string, value: any): void => {
    setParameters((prev) => ({ ...prev, [paramName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!runName.trim()) {
      setError('Run name is required');
      return;
    }

    if (!selectedTarget) {
      setError('Target variable must be selected');
      return;
    }

    setLoading(true);
    try {
      const payload: FSRunCreate = {
        name: runName.trim(),
        method_name: selectedMethod,
        method_category: currentMethod.method_category,
        target_var: selectedTarget,
        parameters,
      };

      await fsRunApi.create(dataset.id, payload);
      setSuccess(true);
      setRunName('');
      setParameters(
        methodParams.reduce((acc, p) => ({ ...acc, [p.name]: p.default }), {})
      );
      onRunCreated?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create execution. Backend may not be ready yet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Run Identification */}
      <div>
        <label className="block text-sm font-medium text-text-h mb-2">Run Name</label>
        <input
          type="text"
          value={runName}
          onChange={(e) => setRunName(e.target.value)}
          placeholder="e.g., Initial Feature Selection"
          className="w-full h-9 px-3 text-sm rounded-lg bg-code-bg border border-border-main text-text-h placeholder:text-text-main/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Target Variable */}
      <div>
        <label className="block text-sm font-medium text-text-h mb-2">Target Variable</label>
        <select
          value={selectedTarget}
          onChange={(e) => setSelectedTarget(e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-lg bg-code-bg border border-border-main text-text-h focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        >
          {dataset.target_variables.map((target) => (
            <option key={target} value={target}>
              {target}
            </option>
          ))}
        </select>
      </div>

      {/* Method Selection */}
      <div>
        <label className="block text-sm font-medium text-text-h mb-3">Feature Selection Method</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {METHODS.map((method) => (
            <button
              key={method.name}
              type="button"
              onClick={() => handleMethodChange(method.name)}
              className={[
                'p-3 rounded-lg border-2 text-left transition-all',
                selectedMethod === method.name
                  ? 'border-accent bg-accent-bg'
                  : 'border-border-main bg-code-bg/40 hover:border-accent-border'
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-text-h">{method.name}</h4>
                  <p className="text-xs text-text-main/60 mt-1">{method.description}</p>
                </div>
                <Badge color={method.category === 'filter' ? 'blue' : 'gray'}>
                  {method.category}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      {methodParams.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-h mb-3">Parameters</label>
          <div className="space-y-3 bg-code-bg/40 p-4 rounded-lg border border-border-main">
            {methodParams.map((param) => (
              <div key={param.name}>
                <label className="block text-xs text-text-main/60 mb-1.5">
                  {param.label}
                </label>
                <input
                  type={param.type}
                  value={parameters[param.name]}
                  onChange={(e) =>
                    handleParameterChange(
                      param.name,
                      param.type === 'number' ? parseInt(e.target.value, 10) : e.target.value
                    )
                  }
                  min="1"
                  className="w-full h-8 px-3 text-sm rounded bg-code-bg border border-border-main text-text-h focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm">
          Execution submitted successfully! Check the History tab for updates.
        </div>
      )}

      {/* Submit Button */}
      <Button
        variant="primary"
        icon={Play}
        loading={loading}
        disabled={!runName.trim() || !selectedTarget}
      >
        Execute Method
      </Button>
    </form>
  );
}
