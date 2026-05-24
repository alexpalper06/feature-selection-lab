import React, {useState, useEffect} from 'react';
import {AlertCircle, Play} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import {fsRunApi} from '../../client/FsRunClient';
import type {DatasetRead} from '../../client/types/DatasetTypes.ts';
import type {FeatureSelectionMethods, FSRunCreate} from "../../client/types/FsRunTypes.ts";

interface ConfigurationTabProps {
    dataset: DatasetRead; // We need the DatasetId in order to execute FS Runs
}

export default function ConfigurationTab({dataset}: ConfigurationTabProps): React.ReactElement {
    // Methods registry state (fetched from backend)
    const [methods, setMethods] = useState<FeatureSelectionMethods[]>([]);
    const [methodsLoading, setMethodsLoading] = useState<boolean>(true);
    const [methodsError, setMethodsError] = useState<string | null>(null);

    // Form state
    const [runName, setRunName] = useState<string>('');
    const [selectedMethodName, setSelectedMethodName] = useState<string>('');
    const [selectedTarget, setSelectedTarget] = useState<string>(dataset.target_variables[0] ?? '');
    const [parameters, setParameters] = useState<Record<string, any>>({});

    // Submission state
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    // Fetch available FS methods from the backend registry when loading the tab page
    useEffect(() => {
        const fetchMethods = async (): Promise<void> => {
            try {
                const data = await fsRunApi.getMethods();
                setMethods(data);
                if (data.length > 0) {
                    initMethod(data[0]);
                }
            } catch (err: any) {
                setMethodsError(err.message ?? 'Could not load feature selection methods.');
            } finally {
                setMethodsLoading(false);
            }
        };
        fetchMethods();
    }, []);

    // https://www.xjavascript.com/blog/typescript-accumulator/
    // We use an accumulator to build the dictionary of parameters from a method on the form data and to set its default values
    // on the parameters that are going to be sent
    const initMethod = (method: FeatureSelectionMethods): void => {
        setSelectedMethodName(method.name);
        setParameters(method.parameters.reduce<Record<string, any>>((accum, param) => (
            {...accum, [param.name]: param.default}), {})
        );
    };

    const selectedMethod = methods.find((method) => method.name === selectedMethodName);

    const handleMethodChange = (method: FeatureSelectionMethods): void => {
        initMethod(method);
    };

    const handleParameterChange = (paramName: string, raw_value: string, type: string): void => {
        const value = type === 'number' ? parseInt(raw_value, 10) : raw_value;
        setParameters((prev) => ({...prev, [paramName]: value}));
    };

    const resetForm = (): void => {
        setRunName('');
        if (selectedMethod) {
            setParameters(
                selectedMethod.parameters.reduce<Record<string, any>>((accum, param) => ({
                    ...accum,
                    [param.name]: param.default
                }), {})
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setSubmitError(null);
        setSuccess(false);

        if (!runName.trim()) {
            setSubmitError('Run name is required.');
            return;
        }
        if (!selectedTarget) {
            setSubmitError('Target variable must be selected.');
            return;
        }
        if (!selectedMethod) {
            setSubmitError('Please select a feature selection method.');
            return;
        }

        setSubmitting(true);
        try {
            const payload: FSRunCreate = {
                name: runName.trim(),
                method_name: selectedMethod.name,
                method_category: selectedMethod.category,
                target_var: selectedTarget,
                parameters,
            };
            await fsRunApi.create(dataset.id, payload);
            setSuccess(true);
            resetForm();
            //setTimeout(() => setSuccess(false), 4000);
        } catch (err: any) {
            setSubmitError(err.message ?? 'Failed to submit execution.');
        } finally {
            setSubmitting(false);
        }
    };

    // Loading error states for the list of available methods
    if (methodsLoading) {
        return (
            <div className="py-24 flex justify-center">
                <Spinner/>
            </div>
        );
    }

    if (methodsError) {
        return (
            <div
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm max-w-2xl mx-auto">
                <AlertCircle className="w-5 h-5 flex-shrink-0"/>
                <p>{methodsError}</p>
            </div>
        );
    }

    const isFormValid = runName.trim().length > 0 && !!selectedTarget && !!selectedMethod;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">

            {/* Run Identification */}
            <div>
                <label className="block text-sm font-medium text-text-h mb-2">Run Name</label>
                <input
                    type="text"
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    placeholder="e.g., Baseline Chi-Square k=10"
                    className="w-full h-9 px-3 text-sm rounded-lg bg-code-bg border border-border-main text-text-h
            placeholder:text-text-main/30 focus:outline-none focus:border-accent focus:ring-1
            focus:ring-accent/30 transition-all"
                />
            </div>

            {/* Target Variable  */}
            <div>
                <label className="block text-sm font-medium text-text-h mb-2">Target Variable</label>
                <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full h-9 px-3 text-sm rounded-lg bg-code-bg border border-border-main text-text-h
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                >
                    {dataset.target_variables.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            {/* Method Selection */}
            <div>
                <label className="block text-sm font-medium text-text-h mb-3">Feature Selection Method</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {methods.map((method) => {
                        const isSelected = selectedMethodName === method.name;
                        return (
                            <button
                                key={method.name}
                                type="button"
                                onClick={() => handleMethodChange(method)}
                                className={['p-3 rounded-lg border-2 text-left transition-all',
                                    isSelected ? 'border-accent bg-accent-bg'
                                        : 'border-border-main bg-surface hover:border-accent-border hover:shadow-sm',
                                ].join(' ')}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-semibold text-text-h">{method.name}</h4>
                                        <p className="text-xs text-text-main/60 mt-1">{method.description}</p>
                                    </div>
                                    <Badge color={method.category === 'filter' ? 'blue' : 'gray'}>
                                        {method.category}
                                    </Badge>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Parameters  */}
            {selectedMethod && selectedMethod.parameters.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-text-h mb-3">Parameters</label>
                    <div className="space-y-3 bg-surface p-4 rounded-lg border border-border-main">
                        {selectedMethod.parameters.map((param) => (
                            <div key={param.name}>
                                <label className="block text-xs text-text-main/60 mb-1.5">{param.label}</label>
                                <input
                                    type={param.type}
                                    value={parameters[param.name] ?? param.default}
                                    onChange={(e) => handleParameterChange(param.name, e.target.value, param.type)}
                                    min={1}
                                    className="w-full h-8 px-3 text-sm rounded bg-code-bg border border-border-main text-text-h
                    focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Feedback messages */}
            {submitError && (
                <div
                    className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                    <p>{submitError}</p>
                </div>
            )}

            {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                    Execution submitted. check the <span className="font-semibold">History</span> tab to check its status.
                </div>
            )}

            {/* Submit */}
            <Button
                type="submit"
                variant="primary"
                icon={Play}
                loading={submitting}
                disabled={!isFormValid || submitting}
            >
                Execute Method
            </Button>
        </form>
    );
}