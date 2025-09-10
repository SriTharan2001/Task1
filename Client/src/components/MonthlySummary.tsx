import React, { useState, useRef, useContext } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SummaryData } from "../Hooks/useMonthlySummary";
import useMonthlySummary from "../Hooks/useMonthlySummary";
import { ThemeContext } from "../context/ThemeContext";

interface MonthlySummaryDesignProps {
  summary?: SummaryData[];
}

const MonthlySummaryDesign: React.FC<MonthlySummaryDesignProps> = ({
  summary: propSummary,
}) => {
  const { summary: apiSummary, loading, error, retry } = useMonthlySummary();
  const summary = propSummary || apiSummary;

  // Scroll container ref
  const scrollRef = useRef<HTMLDivElement>(null);

  // State to toggle arrow buttons on hover
  const [isHovering, setIsHovering] = useState(false);

  // Scroll functions for buttons
  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -100, behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 100, behavior: "smooth" });
    }
  };

  // PDF download function
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Monthly Summary", 14, 22);

    if (summary.length === 0) {
      doc.setFontSize(12);
      doc.text("No expenses found.", 14, 32);
    } else {
      autoTable(doc, {
        startY: 30,
        head: [["Month", "Total (₹)"]],
        body: summary.map(({ month, total }) => [
          month,
          `₹${total.toLocaleString("en-IN", {
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

    doc.save("monthly-summary.pdf");
  };

  const { theme } = useContext(ThemeContext);

  return (
    <div className="max-w-screen-xl mx-auto p-10 bg-blue-100 rounded-lg">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 m-0">📊 Monthly Summary</h1>
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
        <>
          {/* Scrollable container with hover toggle */}
          <div
            className="relative max-h-64 overflow-y-auto bg-white rounded-2xl shadow-md border border-gray-200"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            ref={scrollRef}
          >
            {/* Scroll Up Arrow */}
            {isHovering && (
              <button
                onClick={scrollUp}
                className="absolute top-2 right-2 z-10 p-2 bg-black text-white rounded-full shadow hover:bg-blue-700 transition"
                aria-label="Scroll Up"
                style={{ width: 36, height: 36 }}
              >
                ↑
              </button>
            )}

            {/* Scroll Down Arrow */}
            {isHovering && (
              <button
                onClick={scrollDown}
                className="absolute bottom-2 right-2 z-10 p-2 bg-black text-white rounded-full shadow hover:bg-blue-700 transition"
                aria-label="Scroll Down"
                style={{ width: 36, height: 36 }}
              >
                ↓
              </button>
            )}

            {/* Table */}
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className={`${theme === "dark" ? "bg-blue-600" : "bg-gray-950"} text-amber-50`}>
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
                        RS{" "}
                        {total.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-gray-500">
                      No expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex justify-end mt-2.5">
        <button
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-5 py-2 rounded-xl border-none cursor-pointer transition-all duration-300 hover:from-purple-700 hover:to-pink-600 font-dmsans"
          onClick={downloadPDF}
        >
          ⬇ Download PDF
        </button>
      </div>
    </div>
  );
};

export default MonthlySummaryDesign;
