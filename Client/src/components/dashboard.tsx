import React, { useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import useExpenseDashboard from "../Hooks/useExpenseDashboard";

type Expense = {
  _id: string;
  userId: string;
  amount: number | string;
  category?: string;
  date: string | Date;
};

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const COLORS = [
  "rgba(59, 130, 246, 0.7)",
  "rgba(16, 185, 129, 0.7)",
  "rgba(251, 191, 36, 0.7)",
  "rgba(239, 68, 68, 0.7)",
  "rgba(168, 85, 247, 0.7)",
  "rgba(34, 197, 94, 0.7)",
  "rgba(59, 130, 246, 0.5)",
  "rgba(251, 113, 133, 0.7)",
];

const parseAmount = (value: number | string | undefined): number => {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
};

const getMonthlyExpenseData = (expenses: Expense[]) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const data = months.map((month) => ({ month, amount: 0 }));
  expenses.forEach((e) => {
    const dt = new Date(e.date);
    if (!isNaN(dt.getTime())) {
      data[dt.getMonth()].amount += parseAmount(e.amount);
    }
  });
  return data;
};

const getCategoryWiseData = (expenses: Expense[]) => {
  const totals: Record<string, number> = {};
  expenses.forEach((e) => {
    const cat = e.category || "Uncategorized";
    totals[cat] = (totals[cat] || 0) + parseAmount(e.amount);
  });
  return Object.entries(totals).map(([name, value]) => ({ name, value }));
};

const getTodayExpenses = (expenses: Expense[]): string => {
  const today = new Date().toISOString().split("T")[0];
  const sum = expenses
    .filter((e) => e.date.toString().startsWith(today))
    .reduce((acc, e) => acc + parseAmount(e.amount), 0);
  return sum.toFixed(2);
};

const getMonthlyExpenses = (expenses: Expense[]): string => {
  const now = new Date();
  const sum = expenses
    .filter((e) => {
      const dt = new Date(e.date);
      return (
        !isNaN(dt.getTime()) &&
        dt.getMonth() === now.getMonth() &&
        dt.getFullYear() === now.getFullYear()
      );
    })
    .reduce((acc, e) => acc + parseAmount(e.amount), 0);
  return sum.toFixed(2);
};

const getTotalExpenses = (expenses: Expense[]): string =>
  expenses.reduce((acc, e) => acc + parseAmount(e.amount), 0).toFixed(2);

const Dashboard: React.FC = () => {
  const { expenses, loading, error } = useExpenseDashboard();

  const monthlyData = useMemo(() => getMonthlyExpenseData(expenses), [expenses]);
  const categoryData = useMemo(() => getCategoryWiseData(expenses), [expenses]);
  const total = useMemo(() => getTotalExpenses(expenses), [expenses]);
  const monthly = useMemo(() => getMonthlyExpenses(expenses), [expenses]);
  const today = useMemo(() => getTodayExpenses(expenses), [expenses]);

  if (loading) return <div style={{ padding: "24px", textAlign: "center" }}>Loading...</div>;
  if (error) return <div style={{ padding: "24px", textAlign: "center", color: "#ef4444" }}>Error: {error}</div>;

  const barData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "₹",
        data: monthlyData.map((d) => d.amount),
        backgroundColor: COLORS[0],
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: categoryData.map((d) => d.name),
    datasets: [
      {
        data: categoryData.map((d) => d.value),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  const basePlugins = {
    legend: { position: "top" as const },
    tooltip: { enabled: true },
  };

  const barOptions = { responsive: true, plugins: basePlugins };
  const pieOptions = { responsive: true, plugins: basePlugins };

  return (
    <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Expense Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Card title="Total" value={`₹${total}`} />
        <Card title="This Month" value={`₹${monthly}`} />
        <Card title="Today" value={`₹${today}`} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        <ChartContainer title="Monthly Expenses">
          <Bar data={barData} options={barOptions} />
        </ChartContainer>
        <ChartContainer title="By Category">
          <Pie data={pieData} options={pieOptions} />
        </ChartContainer>
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div
    style={{
      padding: "16px",
      backgroundColor: "#1e40af",
      color: "#ffffff",
      borderRadius: "8px",
    }}
  >
    <h3 style={{ fontSize: "18px" }}>{title}</h3>
    <p style={{ fontSize: "24px" }}>{value}</p>
  </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div
    style={{
      padding: "16px",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    }}
  >
    <h3 style={{ marginBottom: "8px" }}>{title}</h3>
    <div style={{ height: "300px" }}>{children}</div>
  </div>
);

export default Dashboard;
