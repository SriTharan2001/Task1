// src/components/Dashboard.tsx
import React, { useMemo } from "react";
import { Pie, Bar } from "react-chartjs-2";
import useExpenseDashboard from "../Hooks/useExpenseDashBoard.ts";
import useMonthlySummary from "../Hooks/useMonthlySummary";
import useCategoryExpenses from "../Hooks/useCategoryExpenses";
import useExpenseCounters from "../Hooks/useExpenseCounters";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

import type { Chart, TooltipItem } from "chart.js";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

const COLORS = [
  "rgba(59, 130, 246, 0.7)",
  "rgba(16, 185, 129, 0.7)",
  "rgba(251, 191, 36, 0.7)",
  "rgba(239, 68, 68, 0.7)",
  "rgba(168, 85, 247, 0.7)",
  "rgba(34, 197, 94, 0.7)",
  "rgba(251, 113, 133, 0.7)",
];

const getMonthlyExpenseData = (summary: { month: string; total: number }[]) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = months.map((month) => ({ month, amount: 0 }));
  summary.forEach((s) => {
    const [, m] = s.month.split("-");
    const index = parseInt(m, 10) - 1;
    if (index >= 0 && index < 12) {
      data[index].amount += s.total;
    }
  });
  return data;
};

// Card component
const Card: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="p-4 bg-blue-900 text-white rounded-lg">
    <h3>{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

// ChartContainer component
const ChartContainer: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="bg-white rounded-lg p-4 shadow-md h-[500px]">
    <h3 className="mb-4 text-lg font-bold text-center">{title}</h3>
    <div className="h-[calc(100%-40px)]">{children}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const { loading: expensesLoading, error: expenseError } =
    useExpenseDashboard();
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
  } = useMonthlySummary();
  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
  } = useCategoryExpenses();
  const {
    data: counters,
    loading: countersLoading,
    error: countersError,
  } = useExpenseCounters();

  const monthlyData = useMemo(() => getMonthlyExpenseData(summary), [summary]);

  const pieTotal = useMemo(
    () => categoryData.reduce((sum, item) => sum + item.value, 0),
    [categoryData]
  );

  if (expensesLoading || summaryLoading || categoryLoading || countersLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (expenseError || summaryError || categoryError || countersError) {
    return (
      <div className="p-6 text-center text-red-600">
        {expenseError || summaryError || categoryError || countersError}
      </div>
    );
  }

  const pieData = {
    labels: categoryData.map((d) => `${d.name} (${d.count})`),
    datasets: [
      {
        data: categoryData.map((d) => d.value),
        backgroundColor: COLORS.slice(0, categoryData.length),
        borderColor: COLORS.map((c) => c.replace("0.7", "1")).slice(
          0,
          categoryData.length
        ),
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          font: { size: 14 },
          padding: 20,
          generateLabels: (chart: Chart) => {
            const labelsRaw = chart.data.labels;
            const labels: string[] =
              typeof labelsRaw === "string"
                ? [labelsRaw]
                : Array.isArray(labelsRaw)
                ? (labelsRaw as string[])
                : [];

            return labels.map((label: string, i: number) => ({
              text: `${label} - RS ${(
                chart.data.datasets[0].data[i] as number
              ).toFixed(2)} (${(
                ((chart.data.datasets[0].data[i] as number) / pieTotal) *
                100
              ).toFixed(1)}%)`,
              fillStyle: (chart.data.datasets[0].backgroundColor as string[])[
                i
              ],
              index: i,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"pie">) => {
            const label = context.label || "";
            const value = context.raw as number;
            const percentage = ((value / pieTotal) * 100).toFixed(1);
            return `${label}: RS ${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
      title: {
        display: true,
        text: "Expenses By Category",
        font: { size: 16 },
      },
    },
  };

  const barData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "Monthly Expenses (RS)",
        data: monthlyData.map((d) => d.amount),
        backgroundColor: COLORS[0],
        borderColor: COLORS[0].replace("0.7", "1"),
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) =>
            `RS ${(context.raw as number).toFixed(2)}`,
        },
      },
      title: {
        display: true,
        text: "Monthly Summary",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Amount (RS)" },
      },
      x: {
        title: { display: true, text: "Month" },
      },
    },
  };

  return (
    <div className="p-6 max-w-[1280px] mx-auto">
      <h1 className="text-2xl mb-6">Expense Dashboard</h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
        <Card
          title="Total"
          value={`RS ${counters?.total?.toFixed(2) ?? "0.00"}`}
        />
        <Card
          title="This Month"
          value={`RS ${counters?.monthly?.toFixed(2) ?? "0.00"}`}
        />
        <Card
          title="Today"
          value={`RS ${counters?.daily?.toFixed(2) ?? "0.00"}`}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        <ChartContainer title="Expenses By Category">
          <Pie data={pieData} options={pieOptions} />
        </ChartContainer>

        <ChartContainer title="Monthly Summary">
          <Bar data={barData} options={barOptions} />
        </ChartContainer>
      </div>
    </div>
  );
};

export default Dashboard;
