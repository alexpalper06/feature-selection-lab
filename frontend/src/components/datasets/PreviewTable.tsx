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
    <div className="rounded-lg border border-border-main overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto ">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-code-bg border-b border-border-main">
              {columns.map((col) => (
                <th
                  key={col}
                  title={col}
                  className={[
                    'px-3 py-2.5 text-left font-semibold whitespace-nowrap',
                    isTarget(col) ? 'text-accent bg-accent-bg' : 'text-text-h',
                  ].join(' ')}
                >
                  {isTarget(col) && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-1.5 mb-0.5 align-middle" />
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
                  rIdx % 2 === 0 ? 'bg-bg-main' : 'bg-code-bg/40',
                ].join(' ')}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className={[
                      'px-3 py-2 whitespace-nowrap font-mono',
                      isTarget(col) ? 'text-accent font-semibold' : 'text-text-main',
                    ].join(' ')}
                  >
                    {row[col] == null ? (
                      <span className="text-text-main/25 italic not-italic">∅</span>
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

      <div className="px-3 py-1.5 bg-code-bg border-t border-border-main">
        <span className="text-xs text-text-main/40">
          Showing first {rows.length} rows
        </span>
      </div>
    </div>
  );
}