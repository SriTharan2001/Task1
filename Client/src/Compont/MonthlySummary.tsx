import React from 'react';
import type { SummaryData } from '../Hooks/useMonthlySummary';
import useMonthlySummary from '../Hooks/useMonthlySummary';

interface MonthlySummaryDesignProps {
  summary?: SummaryData[];
}

const MonthlySummaryDesign: React.FC<MonthlySummaryDesignProps> = ({ summary: propSummary }) => {
  const { summary: apiSummary, loading, error, retry } = useMonthlySummary();
  const summary = propSummary || apiSummary;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">
          📊 Monthly Summary
        </h1>
        <button
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2 px-5 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
        >
          ⬇ Download PDF
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-6">
          Loading summary...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center text-red-500 dark:text-red-400 py-6">
          {error}
          <button
            onClick={retry}
            className="ml-4 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-x-auto border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-indigo-800 to-blue-700 text-white">
              <tr>
                <th className="px-6 py-4 uppercase tracking-wide text-xs font-semibold">Month</th>
                <th className="px-6 py-4 uppercase tracking-wide text-xs font-semibold">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {summary.length > 0 ? (
                summary.map(({ month, total }: SummaryData) => (
                  <tr
                    key={month}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">
                      {month}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-100 font-semibold">
                      ₹{total.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonthlySummaryDesign;