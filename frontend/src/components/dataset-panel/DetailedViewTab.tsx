import React from 'react';
import {Target, Database, PieChart, FileText} from 'lucide-react';
import Badge from '../ui/Badge';

import PreviewTable from '../datasets/PreviewTable';
import type {DatasetDetails} from '../../client/types/DatasetTypes.ts';

interface DetailedViewTabProps {
    dataset: DatasetDetails;
}

export default function DetailedViewTab({dataset}: DetailedViewTabProps): React.ReactElement {
    return (
        <div className="flex flex-col h-full space-y-6 w-full min-w-0">
            {/* Information Section */}
            <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface rounded-lg p-4 border border-border-main">
                    <p className="text-xs text-text-main/50 mb-2">Total Rows</p>
                    <p className="text-2xl font-bold text-text-h">{dataset.num_rows.toLocaleString()}</p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-border-main">
                    <p className="text-xs text-text-main/50 mb-2">Total Columns</p>
                    <p className="text-2xl font-bold text-text-h">{dataset.num_cols}</p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-border-main">
                    <p className="text-xs text-text-main/50 mb-2">Date of Upload</p>
                    <p className="text-sm font-semibold text-text-h">
                        {new Date(dataset.uploaded_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="bg-surface rounded-lg p-4 border border-border-main">
                    <p className="text-xs text-text-main/50 mb-2">Dataset ID</p>
                    <p className="text-sm font-mono font-semibold text-text-h">#{dataset.id}</p>
                </div>
            </div>
            {/* Dataset Description */}
            {dataset.description && (
                <div className="shrink-0">
                    <h3 className="text-sm font-semibold text-text-h mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-text-main"/>
                        Dataset Description
                    </h3>
                    <p className="text-sm text-text-main text-left bg-surface rounded-lg p-4 border border-border-main">
                        {dataset.description}
                    </p>
                </div>
            )}
            {/* Target Variables Section */}
            <div className="shrink-0">
                <h3 className="text-sm font-semibold text-text-h mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4"/>
                    Target Variables
                </h3>
                {dataset.target_variables.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {dataset.target_variables.map((target) => (
                            <Badge key={target} color="blue">
                                {target}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-text-main/50 italic">No target variables selected</p>
                )}
            </div>

            {/* Distributions Section */}
            {dataset.target_variables.length > 0 && (
                <div className="shrink-0">
                    <h3 className="text-sm font-semibold text-text-h mb-3 flex items-center gap-2">
                        <PieChart className="w-4 h-4"/>
                        Class Distributions
                    </h3>

                    {dataset.class_distribution && Object.keys(dataset.class_distribution).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Object.entries(dataset.class_distribution).map(([targetName, details]) => {
                                // Sort classes by count descending
                                const sortedClasses = Object.entries(details.counts).sort(
                                    ([, countA], [, countB]) => countB - countA
                                );

                                return (
                                    <div key={targetName}
                                         className="bg-surface rounded-lg p-4 border border-border-main flex flex-col h-full max-h-[300px]">
                                        <p className="text-sm font-semibold text-text-h mb-3 shrink-0 flex items-center justify-between">
                                            <span className="truncate pr-2" title={targetName}>{targetName}</span>
                                            <span
                                                className="text-[12px] font-normal px-2 py-0.5 bg-code-bg rounded text-text-main/60 border border-border-main/50">
                                                {sortedClasses.length} distinct
                                            </span>
                                        </p>

                                        {/* Scrollable Container for high number of targets */}
                                        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                                            {sortedClasses.map(([className, count]) => {
                                                const percentage = details.percentages[className] * 100;
                                                return (
                                                    <div key={className} className="flex flex-col gap-1.5">
                                                        <div
                                                            className="flex justify-between text-[12px] text-text-main">
                                                            <span className="font-medium truncate pr-2"
                                                                  title={className}>{className}</span>
                                                            <span className="text-text-main/70 whitespace-nowrap">
                                                                {count} ({percentage.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                        <div
                                                            className="w-full bg-code-bg rounded-full h-1.5 overflow-hidden border border-border-main/30">
                                                            <div
                                                                className="bg-accent h-full rounded-full transition-all duration-500"
                                                                style={{width: `${percentage}%`}}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-text-main/50 italic">No distribution class data available</p>
                    )}
                </div>
            )}

            {/* Data Preview */}
            <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full overflow-hidden">
                <h3 className="text-sm flex items-center gap-2 font-semibold text-text-h mb-4 shrink-0 mt-2">
                    <Database className="w-4 h-4 text-text-main/70"/>
                    Data Preview
                </h3>
                <div className="flex-1 min-h-0 min-w-0 w-full">
                    <PreviewTable
                        columns={dataset.columns}
                        rows={dataset.rows}
                        highlightColumns={dataset.target_variables}
                    />
                </div>
            </div>

        </div>
    );
}