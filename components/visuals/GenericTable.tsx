"use client";

type GenericTableProps = {
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, unknown>>;
  title?: string;
};

export default function GenericTable({ columns, rows, title }: GenericTableProps) {
  if (!columns || columns.length === 0 || !rows || rows.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No table data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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







