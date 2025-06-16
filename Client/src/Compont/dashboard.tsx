// src/Dashboard.tsx
import React, { useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import useExpenseDashboard from '../Hooks/useExpenseDashBoard.ts';
import type { Expense, User } from '../Hooks/useExpenseDashBoard.ts';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const COLORS = [
  'rgba(59, 130, 246, 0.7)',
  'rgba(16, 185, 129, 0.7)',
  'rgba(251, 191, 36, 0.7)',
  'rgba(239, 68, 68, 0.7)',
  'rgba(168, 85, 247, 0.7)',
  'rgba(34, 197, 94, 0.7)',
  'rgba(59, 130, 246, 0.5)',
  'rgba(251, 113, 133, 0.7)',
];

const parseAmount = (value: number | string | undefined): number => {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
};

const getMonthlyExpenseData = (expenses: Expense[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
    const cat = e.category || 'Uncategorized';
    totals[cat] = (totals[cat] || 0) + parseAmount(e.amount);
  });
  return Object.entries(totals).map(([name, value]) => ({ name, value }));
};

const getTodayExpenses = (expenses: Expense[]): string => {
  const today = new Date().toISOString().split('T')[0];
  const sum = expenses
    .filter((e) => e.date.startsWith(today))
    .reduce((acc, e) => acc + parseAmount(e.amount), 0);
  return sum.toFixed(2);
};

const getMonthlyExpenses = (expenses: Expense[]): string => {
  const now = new Date();
  const sum = expenses
    .filter((e) => {
      const dt = new Date(e.date);
      return !isNaN(dt.getTime()) && dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    })
    .reduce((acc, e) => acc + parseAmount(e.amount), 0);
  return sum.toFixed(2);
};

const getTotalExpenses = (expenses: Expense[]): string =>
  expenses.reduce((acc, e) => acc + parseAmount(e.amount), 0).toFixed(2);

const Dashboard: React.FC = () => {
  const { expenses, users, loading, error } = useExpenseDashboard();

  const filteredExpenses = expenses || [];

  const monthlyData = useMemo(() => getMonthlyExpenseData(filteredExpenses), [filteredExpenses]);
  const categoryData = useMemo(() => getCategoryWiseData(filteredExpenses), [filteredExpenses]);
  const total = useMemo(() => getTotalExpenses(filteredExpenses), [filteredExpenses]);
  const monthly = useMemo(() => getMonthlyExpenses(filteredExpenses), [filteredExpenses]);
  const today = useMemo(() => getTodayExpenses(filteredExpenses), [filteredExpenses]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  const barData = {
    labels: monthlyData.map(d => d.month),
    datasets: [{ label: '₹', data: monthlyData.map(d => d.amount), backgroundColor: COLORS[0], borderWidth: 1 }]
  };
  const pieData = {
    labels: categoryData.map(d => d.name),
    datasets: [{ data: categoryData.map(d => d.value), backgroundColor: COLORS, borderWidth: 1 }]
  };

  const basePlugins = {
    legend: { position: 'top' as const },
    tooltip: { enabled: true }
  };
  const barOptions: ChartOptions<'bar'> = { responsive: true, plugins: basePlugins };
  const pieOptions: ChartOptions<'pie'> = { responsive: true, plugins: basePlugins };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl mb-6">Expense Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="Total" value={`₹${total}`} />
        <Card title="This Month" value={`₹${monthly}`} />
        <Card title="Today" value={`₹${today}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Monthly Expenses"><Bar data={barData} options={barOptions} /></ChartContainer>
        <ChartContainer title="By Category"><Pie data={pieData} options={pieOptions} /></ChartContainer>
      </div>

      <UsersTable users={users || []} />
    </div>
  );
};

const Card: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="p-4 bg-blue-700 text-white rounded-lg">
    <h3 className="text-lg">{title}</h3>
    <p className="text-2xl">{value}</p>
  </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h3 className="mb-2">{title}</h3>
    <div style={{ height: 300 }}>{children}</div>
  </div>
);

const UsersTable: React.FC<{ users: User[] }> = ({ users }) => (
  <div className="mt-8 bg-white rounded-lg shadow p-4">
    <h3 className="mb-4">Registered Users</h3>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-100"><th className="py-2 px-4 border">Name</th><th className="py-2 px-4 border">Email</th><th className="py-2 px-4 border">Role</th></tr>
      </thead>
      <tbody>
        {users.length === 0 ? (
          <tr>
            <td className="py-2 px-4 border text-center" colSpan={3}>No users found</td>
          </tr>
        ) : (
          users.map(u => (
            <tr key={u._id || u.email}>
              <td className="py-2 px-4 border">{u.name}</td>

              <td className="py-2 px-4 border">{u.email}</td>
              <td className="py-2 px-4 border">{u.role}</td>
            </tr>
          ))
        )}
      </tbody>

    </table>
  </div>
);

export default Dashboard;
