import React from 'react';

interface PreviewTableProps {
    columns: string[];
    rows: Record<string, any>[];
    highlightColumns?: string[];
}

export default function PreviewTable({
                                         columns = [],
                                         rows = [],
                                         highlightColumns = []
                                     }: PreviewTableProps): React.ReactElement | null {
    if (!columns.length) return null;

    const isTarget = (col: string): boolean => highlightColumns.includes(col);

    return (
        // flex-col lets the inner scroll region expand; h-full so it fills
        // whatever height the parent constrains it to.
        <div className="rounded-xl border border-border-main bg-surface overflow-hidden flex flex-col w-full h-full">

            <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
                <table className="w-full text-xs border-collapse">

                    <thead className="sticky top-0 z-10">
                    <tr className="bg-code-bg border-b border-border-main">
                        {columns.map((col) => (
                            <th
                                key={col}
                                title={col}
                                className={[
                                    'px-4 py-3 font-semibold whitespace-nowrap tracking-wide',
                                    isTarget(col) ? 'text-accent bg-accent-bg' : 'text-text-h',
                                ].join(' ')}
                            >
                                {isTarget(col) && (
                                    <span
                                        className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2 mb-0.5 align-middle shadow-[0_0_5px_var(--color-accent)]"/>
                                )}
                                {col}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((row, rIdx) => (
                        <tr
                            key={rIdx}
                            className={[
                                'border-b border-border-main last:border-0 transition-colors',
                                rIdx % 2 === 0 ? 'bg-surface' : 'bg-code-bg/30',
                            ].join(' ')}
                        >
                            {columns.map((col) => (
                                <td
                                    key={`${rIdx}-${col}`}
                                    className={[
                                        'px-4 py-2 whitespace-nowrap font-mono',
                                        isTarget(col) ? 'text-accent font-semibold bg-accent-bg/10' : 'text-text-main',
                                    ].join(' ')}
                                >
                                    {row[col] == null ? (
                                        <span className="text-text-main/30 not-italic">∅</span>
                                    ) : (
                                        String(row[col])
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* shrink-0 prevents the footer from being squeezed out when space is tight */}
            <div className="shrink-0 px-4 py-2 bg-code-bg border-t border-border-main flex">
            <span className="text-[11px] font-medium text-text-main/65 uppercase tracking-wider mx-auto">
              Showing first {rows.length} rows
            </span>
            </div>
        </div>
    );
}