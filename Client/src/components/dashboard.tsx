import React, { useMemo, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

import useExpenseDashboard from "../Hooks/useExpenseDashBoard";
import useMonthlySummary from "../Hooks/useMonthlySummary";
import useCategoryExpenses from "../Hooks/useCategoryExpenses";
import useExpenseCounters from "../Hooks/useExpenseCounters";
import useAutoLogout from "../Hooks/useAutoLogout";

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

import type { Chart, TooltipItem, LegendItem } from "chart.js";

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
  "rgba(255, 0, 0)",
  "rgba(20, 33, 61, 1)",
  "rgba(33, 56, 90, 0.8)",
  "rgba(90, 120, 150, 0.5)",
  "rgba(88, 28, 135, 0.7)",
  "rgba(110, 140, 170, 0.4)",
  "rgba(60, 87, 120, 0.6)",
];

type Counters = {
  total: number;
  monthly: number;
  daily: number;
};

const getMonthlyExpenseData = (summary: { month: string; total: number }[]) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
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

const Card: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="bg-[#14213D] p-4 md:p-5 rounded-lg text-white shadow-md flex flex-col justify-between h-full">
    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl">{title}</h3>
    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-2">{value}</p>
  </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg min-h-[300px] md:min-h-[350px] h-full flex flex-col">
    <h3 className="mb-4 text-[14px] sm:text-base md:text-xl font-semibold text-center">
      {title}
    </h3>
    <div className="flex-1">{children}</div>
  </div>
);

const DashboardContent: React.FC = () => {
  const { loading: expensesLoading, error: expenseError } = useExpenseDashboard();
  const { summary = [], loading: summaryLoading, error: summaryError } = useMonthlySummary();
  const { data: categoryData = [], loading: categoryLoading, error: categoryError } = useCategoryExpenses();
  const { data: counters = { total: 0, monthly: 0, daily: 0 }, loading: countersLoading, error: countersError } =
    useExpenseCounters() as {
      data: Counters;
      loading: boolean;
      error: string;
    };

  useAutoLogout();

  const monthlyData = useMemo(() => getMonthlyExpenseData(summary), [summary]);
  const pieTotal = useMemo(() =>
    Array.isArray(categoryData)
      ? categoryData.reduce((sum, item) => sum + item.value, 0)
      : 0, [categoryData]);

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
        borderColor: COLORS.slice(0, categoryData.length),
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
          usePointStyle: true,
          pointStyle: "rect" as const,
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
          },
          padding: 20,
          generateLabels: (chart: Chart): LegendItem[] => {
            const labels = chart.data.labels as string[];
            const dataset = chart.data.datasets[0];
            const bgColors = Array.isArray(dataset.backgroundColor)
              ? dataset.backgroundColor
              : COLORS;

            return labels.map((label, i) => {
              const value = dataset.data[i] as number;
              const percent = ((value / pieTotal) * 100).toFixed(1);
              return {
                text: `${label} - RS ${value.toFixed(2)} (${percent}%)`,
                fillStyle: bgColors[i % bgColors.length],
                strokeStyle: bgColors[i % bgColors.length],
                pointStyle: "rect",
                hidden: false,
                datasetIndex: 0,
                index: i,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"pie">) => {
            const value = context.raw as number;
            const percentage = ((value / pieTotal) * 100).toFixed(1);
            return `RS ${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
      title: {
        display: true,
        text: "Expenses By Category",
        font: { size: window.innerWidth < 640 ? 12 : 16 },
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
        borderColor: COLORS[0],
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
        font: { size: window.innerWidth < 640 ? 12 : 16 },
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center sm:text-left">
        Expense Dashboard
      </h1>

      {/* Responsive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card title="Total" value={`RS ${counters.total.toFixed(2)}`} />
        <Card title="This Month" value={`RS ${counters.monthly.toFixed(2)}`} />
        <Card title="Today" value={`RS ${counters.daily.toFixed(2)}`} />
      </div>

      {/* Responsive Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="order-1">
          <ChartContainer title="Expenses By Category">
            <Pie data={pieData} options={pieOptions} />
          </ChartContainer>
        </div>

        <div className="order-2 lg:order-1">
          <ChartContainer title="Monthly Summary">
            <Bar data={barData} options={barOptions} />
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) {
    return <div className="p-6 text-center">Redirecting to login...</div>;
  }

  return <DashboardContent />;
};

export default Dashboard;
