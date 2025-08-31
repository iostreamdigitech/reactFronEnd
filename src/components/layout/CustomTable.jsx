
export default function CustomTable({ data }) {
  if (!data || data.length === 0) {
    return <div className="p-6 text-gray-500">No data</div>;
  }
  const cols = Object.keys(data[0]);

  return (
    <div className="p-4">
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left">
              {cols.map((c) => (
                <th key={c} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide text-xs">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                {cols.map((c) => (
                  <td key={c} className="px-4 py-2 text-gray-800 dark:text-gray-100">{row[c]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile stacked cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((row, i) => (
            <div key={i} className="p-4 space-y-1">
              {cols.map((c) => (
                <div key={c} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{c}</span>
                  <span className="text-gray-900 dark:text-gray-100">{row[c]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
