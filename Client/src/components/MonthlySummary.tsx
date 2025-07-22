import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SummaryData } from '../Hooks/useMonthlySummary';
import useMonthlySummary from '../Hooks/useMonthlySummary';

interface MonthlySummaryDesignProps {
  summary?: SummaryData[];
}

const MonthlySummaryDesign: React.FC<MonthlySummaryDesignProps> = ({ summary: propSummary }) => {
  const { summary: apiSummary, loading, error, retry } = useMonthlySummary();
  const summary = propSummary || apiSummary;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Monthly Summary', 14, 22);

    if (summary.length === 0) {
      doc.setFontSize(12);
      doc.text('No expenses found.', 14, 32);
    } else {
      autoTable(doc, {
        startY: 30,
        head: [['Month', 'Total (₹)']],
        body: summary.map(({ month, total }) => [
          month,
          `₹${total.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        ]),
        styles: {
          fontSize: 12,
        },
        headStyles: {
          fillColor: [55, 48, 163],
          textColor: 255,
        },
      });
    }

    doc.save('monthly-summary.pdf');
  };

  return (
    <div className="max-w-screen-xl mx-auto p-10 bg-blue-100 rounded-lg">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 m-0">📊 Monthly Summary</h1>
        <button
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-5 py-2 rounded-xl border-none cursor-pointer transition-all duration-300 hover:from-purple-700 hover:to-pink-600"
          onClick={downloadPDF}
        >
          ⬇ Download PDF
        </button>
      </div>

      {loading && (
        <div className="text-center text-gray-600 py-6">Loading summary...</div>
      )}

      {error && !loading && (
        <div className="text-center text-red-600 py-6">
          {error}
          <button
            onClick={retry}
            className="ml-4 bg-blue-500 text-white px-3 py-1.5 rounded-md border-none cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-900 to-blue-700 text-white">
                <th className="px-6 py-4 uppercase font-semibold text-left">Month</th>
                <th className="px-6 py-4 uppercase font-semibold text-left">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {summary.length > 0 ? (
                summary.map(({ month, total }) => (
                  <tr
                    key={month}
                    className="transition-colors duration-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-gray-800 font-medium">{month}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      RS {total.toLocaleString('en-IN', {
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
                    className="py-6 text-center text-gray-500"
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
