"use client";

type GenericTableProps = {
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, unknown>>;
  title?: string;
};

export default function GenericTable({ columns, rows, title }: GenericTableProps) {
  if (!columns || columns.length === 0 || !rows || rows.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-neutral-400 mb-2">📋</div>
        <p className="text-neutral-500 text-sm">No table data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-neutral-50 transition-colors">
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td key={col.key} className="px-6 py-4 text-sm text-neutral-900">
                      {typeof value === "number"
                        ? value.toLocaleString("id-ID")
                        : String(value || "-")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}







