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
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px',
        backgroundColor: '#e0f0ff',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#333',
            margin: 0,
          }}
        >
          📊 Monthly Summary
        </h1>
        <button
          style={{
            background: 'linear-gradient(to right, #a855f7, #ec4899)',
            color: '#fff',
            fontWeight: '600',
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'linear-gradient(to right, #9333ea, #db2777)';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'linear-gradient(to right, #a855f7, #ec4899)';
          }}
          onClick={downloadPDF}
        >
          ⬇ Download PDF
        </button>
      </div>

      {loading && (
        <div
          style={{
            textAlign: 'center',
            color: '#555',
            padding: '24px',
          }}
        >
          Loading summary...
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            textAlign: 'center',
            color: '#dc2626',
            padding: '24px',
          }}
        >
          {error}
          <button
            onClick={retry}
            style={{
              marginLeft: '16px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflowX: 'auto',
            border: '1px solid #e5e7eb',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
            }}
          >
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(to right, #3730a3, #1d4ed8)',
                  color: '#fff',
                }}
              >
                <th
                  style={{
                    padding: '16px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    textAlign: 'left',
                  }}
                >
                  Month
                </th>
                <th
                  style={{
                    padding: '16px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    textAlign: 'left',
                  }}
                >
                  Total (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.length > 0 ? (
                summary.map(({ month, total }) => (
                  <tr
                    key={month}
                    style={{
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f9fafb';
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '';
                    }}
                  >
                    <td
                      style={{
                        padding: '16px',
                        color: '#333',
                        fontWeight: 500,
                      }}
                    >
                      {month}
                    </td>
                    <td
                      style={{
                        padding: '16px',
                        color: '#111',
                        fontWeight: 600,
                      }}
                    >
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
                    style={{
                      padding: '24px',
                      textAlign: 'center',
                      color: '#666',
                    }}
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
